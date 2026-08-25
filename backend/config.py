"""
Application configuration.

Loads settings from environment variables (via .env). Never hard-code
secrets or API keys here — see .env.example for the expected variables.
"""

import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


def _bool_env(name: str, default: bool = False) -> bool:
    val = os.environ.get(name)
    if val is None:
        return default
    return val.strip().lower() in ("1", "true", "yes", "on")


class Config:
    """Base configuration shared by all environments."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")

    # Database
    # NOTE: if DATABASE_URL is set in .env as a relative sqlite URI (e.g.
    # "sqlite:///database/disaster.db"), it is resolved relative to the
    # current working directory, which breaks when the app is launched
    # from elsewhere. We always fall back to an absolute path here.
    _default_db_path = os.path.join(BASE_DIR, "database", "disaster.db")
    _env_db_url = os.environ.get("DATABASE_URL")
    if _env_db_url and _env_db_url.startswith("sqlite:///") and not _env_db_url.startswith(
        "sqlite:////"
    ):
        # Relative sqlite URL from .env — make it absolute under BASE_DIR.
        _relative_path = _env_db_url.replace("sqlite:///", "", 1)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, _relative_path)}"
    elif _env_db_url:
        SQLALCHEMY_DATABASE_URI = _env_db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{_default_db_path}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    _env_cors = os.environ.get(
        "CORS_ORIGINS",
        "*"
    )
    if _env_cors.strip() == "*":
        CORS_ORIGINS = "*"
    else:
        CORS_ORIGINS = [
            origin.strip()
            for origin in _env_cors.split(",")
            if origin.strip()
        ]

    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.environ.get("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_CONTENT_LENGTH_MB", 5)) * 1024 * 1024
    ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

    # Server
    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", 5000))
    DEBUG = _bool_env("FLASK_DEBUG", True)

    # Weather integration
    WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")
    WEATHER_API_URL = os.environ.get("WEATHER_API_URL", "")
    USE_SAMPLE_WEATHER = _bool_env("USE_SAMPLE_WEATHER", True)


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
