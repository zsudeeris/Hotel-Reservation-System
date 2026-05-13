from flask import Flask, render_template, request, jsonify, session
import mysql.connector
import random
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = "secretkey"

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="YOUR_MYSQL_PASSWORD",
    database="hotel_reservation"
)

cursor = db.cursor(dictionary=True)


def generate_2fa_code():
    return str(random.randint(100000, 999999))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data["email"]
    password = data["password"]

    cursor.execute(
        "SELECT * FROM users WHERE email=%s AND password=%s",
        (email, password)
    )

    user = cursor.fetchone()

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        })

    code = generate_2fa_code()
    expires = datetime.now() + timedelta(minutes=5)

    cursor.execute(
        """
        UPDATE users
        SET two_factor_code=%s,
            two_factor_expires=%s
        WHERE id=%s
        """,
        (code, expires, user["id"])
    )

    db.commit()

    session["pending_user_id"] = user["id"]

    print("2FA CODE:", code)

    return jsonify({
        "success": True,
        "message": "2FA code generated"
    })


@app.route("/api/verify-2fa", methods=["POST"])
def verify_2fa():
    data = request.get_json()

    entered_code = data["code"]
    user_id = session.get("pending_user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "No pending login"
        })

    cursor.execute(
        "SELECT * FROM users WHERE id=%s",
        (user_id,)
    )

    user = cursor.fetchone()

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        })

    if datetime.now() > user["two_factor_expires"]:
        return jsonify({
            "success": False,
            "message": "Code expired"
        })

    if entered_code != user["two_factor_code"]:
        return jsonify({
            "success": False,
            "message": "Wrong code"
        })

    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session.pop("pending_user_id", None)

    return jsonify({
        "success": True,
        "role": user["role"],
        "name": user["name"]
    })


@app.route("/api/hotels")
def get_hotels():
    cursor.execute("SELECT * FROM hotels WHERE status='ACTIVE'")
    hotels = cursor.fetchall()

    return jsonify(hotels)


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True
    })


if __name__ == "__main__":
    app.run(debug=True)