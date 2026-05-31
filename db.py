import os
import mysql.connector

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "root1234"),
}


def get_connection(use_database=True):
    config = DB_CONFIG.copy()
    if use_database:
        config["database"] = os.environ.get("DB_NAME", "hotel_reservation")
    return mysql.connector.connect(**config)
