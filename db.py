import mysql.connector

DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "root1234",
}


def get_connection(use_database=True):
    config = DB_CONFIG.copy()
    if use_database:
        config["database"] = "hotel_reservation"
    return mysql.connector.connect(
        **config
    )
