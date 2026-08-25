"""
Application entrypoint.

Run with:
    python app.py

This initializes Flask, SQLAlchemy, CORS, Flask-SocketIO, registers all
route blueprints, creates tables if they don't exist, and starts the
Socket.IO-aware dev server.
"""

import os
import sys
import threading

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from extensions import socketio, emit_weather_alert
from models import db

# Make integrations/weather importable from backend.
_INTEGRATIONS_WEATHER = os.path.join(os.path.dirname(__file__), "..", "integrations", "weather")
if os.path.isdir(_INTEGRATIONS_WEATHER):
    sys.path.insert(0, os.path.abspath(_INTEGRATIONS_WEATHER))


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Ensure supporting directories exist.
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)

    # --- Extensions -------------------------------------------------------
    db.init_app(app)
    cors_origins = app.config["CORS_ORIGINS"]
    if cors_origins == "*":
        CORS(app, resources={r"/*": {"origins": "*"}})
        socketio.init_app(app, cors_allowed_origins="*")
    else:
        CORS(app, resources={r"/*": {"origins": cors_origins}})
        socketio.init_app(app, cors_allowed_origins=cors_origins)

    # --- Blueprints ---------------------------------------------------
    from routes import all_blueprints

    for bp in all_blueprints:
        app.register_blueprint(bp)

    # --- Error handlers -----------------------------------------------
    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(413)
    def too_large(_err):
        return jsonify({"error": "Uploaded file exceeds the maximum allowed size."}), 413

    @app.errorhandler(500)
    def server_error(_err):
        return jsonify({"error": "Internal server error."}), 500

    # --- Root and static routes -------------------------------------------
    @app.route("/")
    def index():
        return jsonify({"status": "ok", "service": "AapdaSaarthi Backend API"}), 200

    # --- Serve uploaded incident photos -----------------------------------
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # --- DB bootstrap & auto-seeding -----------------------------------
    with app.app_context():
        db.create_all()
        if not app.config.get("TESTING"):
            try:
                from models.incident import Incident
                if Incident.query.first() is None:
                    print("[app] Database is empty. Auto-seeding initial data...")
                    import seed
                    seed.seed_incidents()
                    seed.seed_teams()
                    seed.seed_shelters()
                    seed.seed_supplies()
                    seed.seed_alerts()
                    db.session.commit()
                    print("[app] Auto-seeding complete.")
            except Exception as exc:
                print(f"[app] Auto-seeding skipped: {exc}")

    # --- Weather socket integration ------------------------------------
    # Register the backend's emit_weather_alert as the callback that the
    # integrations weather_service uses to push alerts to all clients.
    try:
        import weather_service  # noqa: PLC0415
        weather_service.register_emit_callback(emit_weather_alert)
        # Run an initial poll in a background thread so startup is not blocked.
        def _initial_weather_poll():
            try:
                weather_service.poll_and_emit_once()
            except Exception as exc:  # noqa: BLE001
                print(f"[app] Initial weather poll failed (non-fatal): {exc}")
        threading.Thread(target=_initial_weather_poll, daemon=True).start()
        print("[app] Weather socket integration enabled.")
    except ImportError:
        print("[app] integrations/weather not found — weather socket integration skipped.")

    return app


app = create_app()


if __name__ == "__main__":
    socketio.run(
        app,
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"],
        allow_unsafe_werkzeug=True,
    )

