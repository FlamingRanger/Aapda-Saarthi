"""
Application entrypoint.

Run with:
    python app.py

This initializes Flask, SQLAlchemy, CORS, Flask-SocketIO, registers all
route blueprints, creates tables if they don't exist, and starts the
Socket.IO-aware dev server.
"""

import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from extensions import socketio
from models import db


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Ensure supporting directories exist.
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)

    # --- Extensions -------------------------------------------------------
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    socketio.init_app(app, cors_allowed_origins=app.config["CORS_ORIGINS"])

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

    # --- Serve uploaded incident photos -----------------------------------
    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    # --- DB bootstrap ---------------------------------------------------
    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    socketio.run(
        app,
        host=app.config["HOST"],
        port=app.config["PORT"],
        debug=app.config["DEBUG"],
    )
