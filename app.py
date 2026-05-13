from datetime import datetime, timedelta
import os
import random

from flask import Flask, jsonify, render_template, request, session
from mysql.connector import Error
from werkzeug.security import check_password_hash, generate_password_hash

from db import get_connection


app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "local-dev-secret-key")


TWO_FACTOR_MINUTES = 5


def generate_2fa_code():
    return str(random.randint(100000, 999999))


def run_query(query, params=None, fetchone=False, fetchall=False, commit=False):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(query, params or ())
        result = None
        if fetchone:
            result = cursor.fetchone()
        elif fetchall:
            result = cursor.fetchall()
        if commit:
            conn.commit()
        return result
    finally:
        cursor.close()
        conn.close()


def ensure_database():
    server_conn = get_connection(use_database=False)
    server_cursor = server_conn.cursor()
    try:
        server_cursor.execute("CREATE DATABASE IF NOT EXISTS hotel_reservation")
        server_conn.commit()
    finally:
        server_cursor.close()
        server_conn.close()

    statements = [
        """
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(30),
          role ENUM('USER', 'CUSTOMER', 'ADMIN', 'HOTEL_MANAGER') DEFAULT 'USER',
          two_factor_code VARCHAR(6),
          two_factor_expires DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        "ALTER TABLE users ADD COLUMN phone VARCHAR(30)",
        "ALTER TABLE users ADD COLUMN two_factor_code VARCHAR(6)",
        "ALTER TABLE users ADD COLUMN two_factor_expires DATETIME",
        "ALTER TABLE users MODIFY COLUMN role ENUM('USER', 'CUSTOMER', 'ADMIN', 'HOTEL_MANAGER') DEFAULT 'USER'",
        """
        CREATE TABLE IF NOT EXISTS hotels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          hotel_name VARCHAR(160) NOT NULL,
          city VARCHAR(120) NOT NULL,
          score DECIMAL(3,1) DEFAULT 9.0,
          label VARCHAR(40) DEFAULT 'Excellent',
          reviews VARCHAR(60) DEFAULT '100 reviews',
          price VARCHAR(60) DEFAULT 'Price from EUR 250',
          img VARCHAR(500),
          status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        "ALTER TABLE hotels ADD COLUMN score DECIMAL(3,1) DEFAULT 9.0",
        "ALTER TABLE hotels ADD COLUMN label VARCHAR(40) DEFAULT 'Excellent'",
        "ALTER TABLE hotels ADD COLUMN reviews VARCHAR(60) DEFAULT '100 reviews'",
        "ALTER TABLE hotels ADD COLUMN price VARCHAR(60) DEFAULT 'Price from EUR 250'",
        "ALTER TABLE hotels ADD COLUMN img VARCHAR(500)",
        """
        CREATE TABLE IF NOT EXISTS rooms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          room_number VARCHAR(20) NOT NULL,
          room_type VARCHAR(50) NOT NULL,
          capacity INT NOT NULL,
          price_per_night DECIMAL(10,2) NOT NULL,
          description TEXT,
          status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS reservations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          room_id INT,
          check_in_date DATE NOT NULL,
          check_out_date DATE NOT NULL,
          guest_count INT NOT NULL,
          total_price DECIMAL(10,2),
          status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
          reservation_source ENUM('MANUAL', 'CHATBOT') DEFAULT 'MANUAL',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
    ]

    conn = get_connection()
    cursor = conn.cursor()
    try:
        for statement in statements:
            try:
                cursor.execute(statement)
            except Error as exc:
                if exc.errno != 1060:
                    raise
        conn.commit()
    finally:
        cursor.close()
        conn.close()

    try:
        run_query("UPDATE hotels SET score=rating WHERE score IS NULL AND rating IS NOT NULL", commit=True)
    except Error as exc:
        if exc.errno != 1054:
            raise
    try:
        run_query("UPDATE hotels SET img=image_url WHERE img IS NULL AND image_url IS NOT NULL", commit=True)
    except Error as exc:
        if exc.errno != 1054:
            raise
    seed_users()
    seed_hotels()


def seed_users():
    users = [
        ("Test User", "test@test.com", "Test1234", "USER", "+905551112233"),
        ("Admin User", "admin@hotel.com", "Admin1234", "ADMIN", "+905551112244"),
        ("Hotel Manager", "manager@hotel.com", "Manager1234", "HOTEL_MANAGER", "+905551112255"),
    ]

    for name, email, password, role, phone in users:
        existing = run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True)
        if not existing:
            run_query(
                """
                INSERT INTO users (name, email, password, role, phone)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (name, email, generate_password_hash(password), role, phone),
                commit=True,
            )


def seed_hotels():
    existing = run_query("SELECT id FROM hotels LIMIT 1", fetchone=True)
    if existing:
        return

    hotels = [
        ("The Landmark Nicosia - Autograph Collection", "Lefkosa, Cyprus", 9.4, "Excellent", "54 reviews", "Price from EUR 303", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70"),
        ("Merit Park Hotel - Casino & Spa", "Girne, Cyprus", 9.0, "Excellent", "491 reviews", "Price from EUR 748", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70"),
        ("Cratos Premium Hotel - Casino & Spa", "Girne, Cyprus", 9.0, "Excellent", "413 reviews", "Starting from EUR 760", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=70"),
        ("Salamis Bay Conti Hotel", "Famagusta, Cyprus", 8.7, "Good", "2,169 reviews", "Starting from EUR 292", "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=70"),
    ]
    for hotel in hotels:
        run_query(
            """
            INSERT INTO hotels (hotel_name, city, score, label, reviews, price, img)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            hotel,
            commit=True,
        )


def start_2fa_for_user(user_id, email):
    code = generate_2fa_code()
    expires = datetime.now() + timedelta(minutes=TWO_FACTOR_MINUTES)
    run_query(
        """
        UPDATE users
        SET two_factor_code=%s, two_factor_expires=%s
        WHERE id=%s
        """,
        (code, expires, user_id),
        commit=True,
    )
    session["pending_user_id"] = user_id
    print(f"2FA CODE for {email}: {code}")
    return code


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or email.split("@")[0] or "Guest").strip()
    phone = (data.get("phone") or "").strip()

    if not email or "@" not in email or len(password) < 8:
        return jsonify(success=False, message="Please enter a valid email and strong password."), 400

    if run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True):
        return jsonify(success=False, message="This email is already registered."), 409

    run_query(
        """
        INSERT INTO users (name, email, password, phone, role)
        VALUES (%s, %s, %s, %s, 'USER')
        """,
        (name, email, generate_password_hash(password), phone),
        commit=True,
    )
    user = run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True)
    code = start_2fa_for_user(user["id"], email)

    return jsonify(success=True, message="Account created. Enter the local 2FA code.", debug_code=code)


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role_hint = data.get("role")

    user = run_query("SELECT * FROM users WHERE email=%s", (email,), fetchone=True)
    if not user:
        return jsonify(success=False, message="Invalid email or password."), 401

    valid_password = check_password_hash(user["password"], password)
    if not valid_password and user["password"] == password:
        valid_password = True
        run_query(
            "UPDATE users SET password=%s WHERE id=%s",
            (generate_password_hash(password), user["id"]),
            commit=True,
        )

    if not valid_password:
        return jsonify(success=False, message="Invalid email or password."), 401

    if role_hint and user["role"] != role_hint:
        return jsonify(success=False, message="This account does not have the requested role."), 403

    code = start_2fa_for_user(user["id"], email)
    return jsonify(success=True, message="2FA code generated.", debug_code=code)


@app.route("/api/resend-2fa", methods=["POST"])
def resend_2fa():
    user_id = session.get("pending_user_id")
    if not user_id:
        return jsonify(success=False, message="No pending login."), 400

    user = run_query("SELECT id, email FROM users WHERE id=%s", (user_id,), fetchone=True)
    if not user:
        return jsonify(success=False, message="User not found."), 404

    code = start_2fa_for_user(user["id"], user["email"])
    return jsonify(success=True, message="A new 2FA code was generated.", debug_code=code)


@app.route("/api/verify-2fa", methods=["POST"])
def verify_2fa():
    data = request.get_json() or {}
    entered_code = (data.get("code") or "").strip()
    user_id = session.get("pending_user_id")

    if not user_id:
        return jsonify(success=False, message="No pending login."), 400

    user = run_query("SELECT * FROM users WHERE id=%s", (user_id,), fetchone=True)
    if not user:
        return jsonify(success=False, message="User not found."), 404

    expires = user.get("two_factor_expires")
    if not expires or datetime.now() > expires:
        return jsonify(success=False, message="Code expired."), 400

    if entered_code != user.get("two_factor_code"):
        return jsonify(success=False, message="Wrong code."), 400

    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session.pop("pending_user_id", None)

    run_query(
        "UPDATE users SET two_factor_code=NULL, two_factor_expires=NULL WHERE id=%s",
        (user["id"],),
        commit=True,
    )

    return jsonify(success=True, role=user["role"], name=user["name"])


@app.route("/api/me")
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(authenticated=False)

    user = run_query(
        "SELECT id, name, email, role FROM users WHERE id=%s",
        (user_id,),
        fetchone=True,
    )
    return jsonify(authenticated=bool(user), user=user)


@app.route("/api/hotels")
def get_hotels():
    hotels = run_query(
        "SELECT id, hotel_name, city, score, label, reviews, price, img FROM hotels WHERE status='ACTIVE' ORDER BY score DESC",
        fetchall=True,
    )
    return jsonify(hotels)


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify(success=True)


if __name__ == "__main__":
    ensure_database()
    app.run(debug=True)
