from datetime import datetime, timedelta
import os
import random

from flask import Flask, jsonify, render_template, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from db import get_connection


app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "local-dev-secret-key")

TWO_FACTOR_MINUTES = 5


def generate_2fa_code():
    return str(random.randint(100000, 999999))


def run_query(query, params=None, fetchone=False, fetchall=False, commit=False, return_lastrowid=False):
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
        if return_lastrowid:
            return cursor.lastrowid
        return result
    finally:
        cursor.close()
        conn.close()


def start_2fa_for_user(user_id, email):
    code = generate_2fa_code()
    expires = datetime.now() + timedelta(minutes=TWO_FACTOR_MINUTES)
    run_query(
        "UPDATE users SET two_factor_code=%s, two_factor_expires=%s WHERE id=%s",
        (code, expires, user_id), commit=True,
    )
    session["pending_user_id"] = user_id
    print(f"2FA CODE for {email}: {code}")
    return code


# ── AUTH ─────────────────────────────────────────

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
        return jsonify(success=False, message="Geçerli email ve güçlü şifre giriniz."), 400

    if run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True):
        return jsonify(success=False, message="Bu email zaten kayıtlı."), 409

    run_query(
        "INSERT INTO users (name, email, password, phone, role) VALUES (%s,%s,%s,%s,'USER')",
        (name, email, generate_password_hash(password), phone), commit=True,
    )
    user = run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True)
    code = start_2fa_for_user(user["id"], email)
    return jsonify(success=True, message="Hesap oluşturuldu.", debug_code=code)


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role_hint = data.get("role")

    user = run_query("SELECT * FROM users WHERE email=%s", (email,), fetchone=True)
    if not user:
        return jsonify(success=False, message="Email veya şifre hatalı."), 401

    valid_password = check_password_hash(user["password"], password)
    if not valid_password and user["password"] == password:
        valid_password = True
        run_query("UPDATE users SET password=%s WHERE id=%s",
                  (generate_password_hash(password), user["id"]), commit=True)

    if not valid_password:
        return jsonify(success=False, message="Email veya şifre hatalı."), 401

    if role_hint == "ADMIN" and user["role"] not in ("ADMIN", "HOTEL_MANAGER"):
        return jsonify(success=False, message="Bu hesap admin veya hotel manager değil."), 403

    code = start_2fa_for_user(user["id"], email)
    return jsonify(success=True, message="2FA kodu oluşturuldu.", debug_code=code)


@app.route("/api/resend-2fa", methods=["POST"])
def resend_2fa():
    user_id = session.get("pending_user_id")
    if not user_id:
        return jsonify(success=False, message="Bekleyen giriş yok."), 400
    user = run_query("SELECT id, email FROM users WHERE id=%s", (user_id,), fetchone=True)
    if not user:
        return jsonify(success=False, message="Kullanıcı bulunamadı."), 404
    code = start_2fa_for_user(user["id"], user["email"])
    return jsonify(success=True, message="Yeni 2FA kodu oluşturuldu.", debug_code=code)


@app.route("/api/verify-2fa", methods=["POST"])
def verify_2fa():
    data = request.get_json() or {}
    entered_code = (data.get("code") or "").strip()
    user_id = session.get("pending_user_id")

    if not user_id:
        return jsonify(success=False, message="Bekleyen giriş yok."), 400

    user = run_query("SELECT * FROM users WHERE id=%s", (user_id,), fetchone=True)
    if not user:
        return jsonify(success=False, message="Kullanıcı bulunamadı."), 404

    expires = user.get("two_factor_expires")
    if not expires or datetime.now() > expires:
        return jsonify(success=False, message="Kod süresi doldu. Tekrar gönderiniz."), 400

    if entered_code != user.get("two_factor_code"):
        return jsonify(success=False, message="Yanlış kod."), 400

    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session.pop("pending_user_id", None)

    run_query("UPDATE users SET two_factor_code=NULL, two_factor_expires=NULL WHERE id=%s",
              (user["id"],), commit=True)

    return jsonify(success=True, role=user["role"], name=user["name"])


@app.route("/api/me")
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(authenticated=False)
    user = run_query(
        "SELECT id, name, email, role, phone FROM users WHERE id=%s",
        (user_id,), fetchone=True,
    )
    return jsonify(authenticated=bool(user), user=user)


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify(success=True)


@app.route("/api/register-staff", methods=["POST"])
def register_staff():
    data     = request.get_json() or {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name     = (data.get("name") or "").strip()
    role     = data.get("role", "ADMIN")

    if role not in ("ADMIN", "HOTEL_MANAGER"):
        return jsonify(success=False, message="Invalid role."), 400

    if not email or "@" not in email or len(password) < 8:
        return jsonify(success=False, message="Valid email and strong password required."), 400

    if run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True):
        return jsonify(success=False, message="This email is already registered."), 409

    run_query(
        "INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)",
        (name, email, generate_password_hash(password), role),
        commit=True,
    )
    user = run_query("SELECT id FROM users WHERE email=%s", (email,), fetchone=True)
    code = start_2fa_for_user(user["id"], email)
    return jsonify(success=True, message="Staff account created.", debug_code=code)


@app.route("/api/reviews", methods=["POST"])
def add_review():
    data          = request.get_json() or {}
    hotel_id      = data.get("hotel_id")
    rating        = data.get("rating")
    comment       = (data.get("comment") or "").strip()
    reviewer_name = (data.get("reviewer_name") or "Guest").strip()
    user_id       = session.get("user_id")

    if not hotel_id or not rating or not comment:
        return jsonify(success=False, message="Eksik alan var."), 400

    run_query(
        "INSERT INTO reviews (hotel_id, user_id, reviewer_name, rating, comment) VALUES (%s,%s,%s,%s,%s)",
        (hotel_id, user_id, reviewer_name, rating, comment), commit=True,
    )
    return jsonify(success=True, message="Yorum eklendi.")


@app.route("/api/profile", methods=["PUT"])
def update_profile():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(success=False, message="Giriş yapılmamış."), 401
    data  = request.get_json() or {}
    name  = (data.get("name") or "").strip()
    phone = (data.get("phone") or "").strip()
    if name:
        run_query("UPDATE users SET name=%s, phone=%s WHERE id=%s",
                  (name, phone, user_id), commit=True)
    return jsonify(success=True, message="Profil güncellendi.")


@app.route("/api/change-password", methods=["POST"])
def change_password():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(success=False, message="Giriş yapılmamış."), 401
    data         = request.get_json() or {}
    current_pw   = data.get("current_password") or ""
    new_pw       = data.get("new_password") or ""

    if len(new_pw) < 8:
        return jsonify(success=False, message="Şifre en az 8 karakter olmalı."), 400

    user = run_query("SELECT * FROM users WHERE id=%s", (user_id,), fetchone=True)
    if not user or not check_password_hash(user["password"], current_pw):
        return jsonify(success=False, message="Mevcut şifre yanlış."), 401

    run_query("UPDATE users SET password=%s WHERE id=%s",
              (generate_password_hash(new_pw), user_id), commit=True)
    return jsonify(success=True, message="Şifre başarıyla değiştirildi.")


@app.route("/api/manager/stats")
def manager_stats():
    if session.get("role") not in ("HOTEL_MANAGER", "ADMIN"):
        return jsonify(success=False, message="Yetki yok."), 403
    stats = {
        "total_reservations": (run_query("SELECT COUNT(*) as c FROM reservations WHERE status='CONFIRMED'", fetchone=True) or {}).get("c", 0),
        "total_revenue":      (run_query("SELECT COALESCE(SUM(total_price),0) as s FROM reservations WHERE status='CONFIRMED'", fetchone=True) or {}).get("s", 0),
        "occupancy_rate":     78,
    }
    return jsonify(stats)


@app.route("/api/manager/reservations")
def manager_reservations():
    if session.get("role") not in ("HOTEL_MANAGER", "ADMIN"):
        return jsonify(success=False, message="Yetki yok."), 403
    reservations = run_query(
        """SELECT r.*, h.hotel_name, rm.room_type, rm.room_number
           FROM reservations r
           LEFT JOIN hotels h  ON r.hotel_id = h.id
           LEFT JOIN rooms  rm ON r.room_id  = rm.id
           ORDER BY r.created_at DESC LIMIT 20""",
        fetchall=True,
    )
    return jsonify(reservations or [])


# ── HOTELS ───────────────────────────────────────

@app.route("/api/hotels")
def get_hotels():
    hotels = run_query(
        """SELECT id, hotel_name, city, district, score, label, reviews, review_count,
                  price, price_from, img, description, amenities, stars
           FROM hotels WHERE status='ACTIVE' ORDER BY score DESC""",
        fetchall=True,
    )
    return jsonify(hotels or [])


@app.route("/api/hotels/search")
def search_hotels():
    q          = request.args.get("q", "").strip()
    city       = request.args.get("city", "").strip()
    min_price  = request.args.get("min_price", "")
    max_price  = request.args.get("max_price", "")
    min_score  = request.args.get("min_score", "")
    sort       = request.args.get("sort", "score_desc")
    amenity    = request.args.get("amenity", "").strip()

    conditions = ["status='ACTIVE'"]
    params = []

    if q:
        conditions.append("(hotel_name LIKE %s OR city LIKE %s OR district LIKE %s OR description LIKE %s)")
        like = f"%{q}%"
        params += [like, like, like, like]

    if city:
        conditions.append("(city LIKE %s OR district LIKE %s)")
        like = f"%{city}%"
        params += [like, like]

    if min_price:
        try:
            conditions.append("price_from >= %s")
            params.append(float(min_price))
        except ValueError:
            pass

    if max_price:
        try:
            conditions.append("price_from <= %s")
            params.append(float(max_price))
        except ValueError:
            pass

    if min_score:
        try:
            conditions.append("score >= %s")
            params.append(float(min_score))
        except ValueError:
            pass

    if amenity:
        conditions.append("amenities LIKE %s")
        params.append(f"%{amenity}%")

    where = " AND ".join(conditions)
    sort_map = {
        "price_asc":    "price_from ASC",
        "price_desc":   "price_from DESC",
        "score_desc":   "score DESC",
        "score_asc":    "score ASC",
        "reviews_desc": "review_count DESC",
        "popular":      "review_count DESC",
        "recommended":  "score DESC, review_count DESC",
        "name_asc":     "hotel_name ASC",
    }
    order_by = sort_map.get(sort, "score DESC, review_count DESC")

    query = f"""
        SELECT id, hotel_name, city, district, score, label,
               reviews, review_count, price, price_from, img,
               description, amenities, stars
        FROM hotels
        WHERE {where}
        ORDER BY {order_by}
        LIMIT 50
    """
    hotels = run_query(query, tuple(params), fetchall=True)
    return jsonify(hotels or [])


@app.route("/api/hotels/<int:hotel_id>")
def get_hotel(hotel_id):
    hotel = run_query(
        """SELECT id, hotel_name, city, district, score, label, reviews, review_count,
                  price, price_from, img, description, amenities, stars
           FROM hotels WHERE id=%s AND status='ACTIVE'""",
        (hotel_id,), fetchone=True,
    )
    if not hotel:
        return jsonify(error="Otel bulunamadı."), 404

    rooms = run_query(
        "SELECT * FROM rooms WHERE hotel_id=%s AND status='ACTIVE' ORDER BY price_per_night",
        (hotel_id,), fetchall=True,
    )
    reviews = run_query(
        "SELECT reviewer_name, rating, comment, created_at FROM reviews WHERE hotel_id=%s ORDER BY created_at DESC LIMIT 10",
        (hotel_id,), fetchall=True,
    )
    hotel["rooms"] = rooms or []
    hotel["guest_reviews"] = reviews or []
    return jsonify(hotel)


# ── ROOMS ─────────────────────────────────────────

@app.route("/api/hotels/<int:hotel_id>/rooms")
def get_hotel_rooms(hotel_id):
    checkin  = request.args.get("checkin")
    checkout = request.args.get("checkout")

    rooms = run_query(
        "SELECT * FROM rooms WHERE hotel_id=%s AND status='ACTIVE'",
        (hotel_id,), fetchall=True,
    )

    if checkin and checkout and rooms:
        for room in rooms:
            conflict = run_query(
                """SELECT id FROM reservations
                   WHERE room_id=%s AND status='CONFIRMED'
                   AND NOT (check_out_date <= %s OR check_in_date >= %s)""",
                (room["id"], checkin, checkout), fetchone=True,
            )
            room["available"] = not bool(conflict)

    return jsonify(rooms or [])


# ── RESERVATIONS ──────────────────────────────────

@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data     = request.get_json() or {}
    user_id  = session.get("user_id")
    room_id  = data.get("room_id")
    hotel_id = data.get("hotel_id")
    checkin  = data.get("check_in_date")
    checkout = data.get("check_out_date")
    guests   = data.get("guest_count", 1)
    guest_name  = data.get("guest_name", "")
    guest_email = data.get("guest_email", "")
    guest_phone = data.get("guest_phone", "")
    source   = data.get("source", "MANUAL")

    if not all([room_id, checkin, checkout]):
        return jsonify(success=False, message="Eksik alan var."), 400

    conflict = run_query(
        """SELECT id FROM reservations
           WHERE room_id=%s AND status='CONFIRMED'
           AND NOT (check_out_date <= %s OR check_in_date >= %s)""",
        (room_id, checkin, checkout), fetchone=True,
    )
    if conflict:
        return jsonify(success=False, message="Seçilen tarihlerde oda müsait değil."), 409

    room = run_query("SELECT * FROM rooms WHERE id=%s", (room_id,), fetchone=True)
    if not room:
        return jsonify(success=False, message="Oda bulunamadı."), 404

    try:
        nights = (datetime.strptime(checkout, "%Y-%m-%d") - datetime.strptime(checkin, "%Y-%m-%d")).days
        if nights <= 0:
            return jsonify(success=False, message="Çıkış tarihi girişten sonra olmalı."), 400
        total = float(room["price_per_night"]) * nights
    except Exception:
        total = 0.0

    new_id = run_query(
        """INSERT INTO reservations
           (user_id, hotel_id, room_id, check_in_date, check_out_date,
            guest_count, total_price, guest_name, guest_email, guest_phone, reservation_source)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (user_id, hotel_id, room_id, checkin, checkout,
         guests, total, guest_name, guest_email, guest_phone, source),
        commit=True, return_lastrowid=True,
    )
    booking_ref = f"BK-{datetime.now().year}-{new_id:06d}" if new_id else "BK-UNKNOWN"

    return jsonify(success=True, reservation_id=new_id,
                   booking_ref=booking_ref, total_price=total, nights=nights)


@app.route("/api/reservations", methods=["GET"])
def get_reservations():
    user_id = session.get("user_id")
    role    = session.get("role")

    if not user_id:
        return jsonify(success=False, message="Giriş yapılmamış."), 401

    if role == "ADMIN":
        reservations = run_query(
            """SELECT r.*, u.name as user_name, u.email as user_email,
                      rm.room_type, rm.room_number, h.hotel_name
               FROM reservations r
               LEFT JOIN users u  ON r.user_id = u.id
               LEFT JOIN rooms rm ON r.room_id  = rm.id
               LEFT JOIN hotels h ON r.hotel_id = h.id
               ORDER BY r.created_at DESC LIMIT 100""",
            fetchall=True,
        )
    else:
        reservations = run_query(
            """SELECT r.*, rm.room_type, rm.room_number, h.hotel_name
               FROM reservations r
               LEFT JOIN rooms rm ON r.room_id  = rm.id
               LEFT JOIN hotels h ON r.hotel_id = h.id
               WHERE r.user_id=%s ORDER BY r.created_at DESC""",
            (user_id,), fetchall=True,
        )
    return jsonify(reservations or [])


@app.route("/api/reservations/<int:res_id>/cancel", methods=["POST"])
def cancel_reservation(res_id):
    user_id = session.get("user_id")
    role    = session.get("role")

    if not user_id:
        return jsonify(success=False, message="Giriş yapılmamış."), 401

    res = run_query("SELECT * FROM reservations WHERE id=%s", (res_id,), fetchone=True)
    if not res:
        return jsonify(success=False, message="Rezervasyon bulunamadı."), 404

    if role != "ADMIN" and res["user_id"] != user_id:
        return jsonify(success=False, message="Yetki yok."), 403

    run_query("UPDATE reservations SET status='CANCELLED' WHERE id=%s", (res_id,), commit=True)
    return jsonify(success=True, message="Rezervasyon iptal edildi.")


# ── PAYMENT ───────────────────────────────────────

@app.route("/api/payments", methods=["POST"])
def process_payment():
    data           = request.get_json() or {}
    reservation_id = data.get("reservation_id")
    amount         = data.get("amount", 0)
    method         = data.get("method", "credit_card")
    card_last4     = data.get("card_last4", "0000")

    success = random.random() > 0.05
    status  = "SUCCESS" if success else "FAILED"
    ref     = f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000,9999)}"

    if reservation_id:
        run_query(
            "INSERT INTO payments (reservation_id, amount, method, status, transaction_ref) VALUES (%s,%s,%s,%s,%s)",
            (reservation_id, amount, method, status, ref), commit=True,
        )

    if success:
        return jsonify(success=True, status="SUCCESS", transaction_ref=ref,
                       message="Ödeme başarılı.", card_last4=card_last4)
    else:
        return jsonify(success=False, status="FAILED", transaction_ref=ref,
                       message="Kart doğrulaması başarısız.")


# ── ADMIN ─────────────────────────────────────────

def require_admin():
    if session.get("role") != "ADMIN":
        return jsonify(success=False, message="Admin yetkisi gerekli."), 403
    return None


@app.route("/api/admin/hotels", methods=["GET"])
def admin_get_hotels():
    err = require_admin()
    if err: return err
    hotels = run_query("SELECT * FROM hotels ORDER BY created_at DESC", fetchall=True)
    return jsonify(hotels or [])


@app.route("/api/admin/hotels", methods=["POST"])
def admin_add_hotel():
    err = require_admin()
    if err: return err
    data = request.get_json() or {}
    run_query(
        """INSERT INTO hotels (hotel_name, city, district, score, label, reviews, review_count,
                               price, price_from, img, description, amenities, stars, status)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'ACTIVE')""",
        (data.get("hotel_name"), data.get("city"), data.get("district"),
         data.get("score", 8.0), data.get("label", "Good"),
         data.get("reviews", "0 reviews"), data.get("review_count", 0),
         data.get("price", ""), data.get("price_from", 0),
         data.get("img", ""), data.get("description", ""),
         data.get("amenities", ""), data.get("stars", 4)),
        commit=True,
    )
    return jsonify(success=True, message="Otel eklendi.")


@app.route("/api/admin/hotels/<int:hotel_id>", methods=["PUT"])
def admin_update_hotel(hotel_id):
    err = require_admin()
    if err: return err
    data = request.get_json() or {}
    run_query(
        """UPDATE hotels SET hotel_name=%s, city=%s, district=%s, score=%s, label=%s,
                             price=%s, price_from=%s, description=%s, amenities=%s, stars=%s
           WHERE id=%s""",
        (data.get("hotel_name"), data.get("city"), data.get("district"),
         data.get("score"), data.get("label"), data.get("price"),
         data.get("price_from"), data.get("description"),
         data.get("amenities"), data.get("stars"), hotel_id),
        commit=True,
    )
    return jsonify(success=True, message="Otel güncellendi.")


@app.route("/api/admin/hotels/<int:hotel_id>", methods=["DELETE"])
def admin_delete_hotel(hotel_id):
    err = require_admin()
    if err: return err
    run_query("UPDATE hotels SET status='INACTIVE' WHERE id=%s", (hotel_id,), commit=True)
    return jsonify(success=True, message="Otel deaktif edildi.")


@app.route("/api/admin/users", methods=["GET"])
def admin_get_users():
    err = require_admin()
    if err: return err
    users = run_query(
        "SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC",
        fetchall=True,
    )
    return jsonify(users or [])


@app.route("/api/admin/users/<int:user_id>/role", methods=["PUT"])
def admin_update_user_role(user_id):
    err = require_admin()
    if err: return err
    data = request.get_json() or {}
    role = data.get("role")
    if role not in ("USER", "CUSTOMER", "ADMIN", "HOTEL_MANAGER"):
        return jsonify(success=False, message="Geçersiz rol."), 400
    run_query("UPDATE users SET role=%s WHERE id=%s", (role, user_id), commit=True)
    return jsonify(success=True, message="Rol güncellendi.")


@app.route("/api/admin/stats")
def admin_stats():
    err = require_admin()
    if err: return err
    stats = {
        "total_hotels":        (run_query("SELECT COUNT(*) as c FROM hotels WHERE status='ACTIVE'", fetchone=True) or {}).get("c", 0),
        "total_users":         (run_query("SELECT COUNT(*) as c FROM users", fetchone=True) or {}).get("c", 0),
        "total_reservations":  (run_query("SELECT COUNT(*) as c FROM reservations", fetchone=True) or {}).get("c", 0),
        "confirmed_reservations": (run_query("SELECT COUNT(*) as c FROM reservations WHERE status='CONFIRMED'", fetchone=True) or {}).get("c", 0),
        "total_revenue":       (run_query("SELECT COALESCE(SUM(amount),0) as s FROM payments WHERE status='SUCCESS'", fetchone=True) or {}).get("s", 0),
    }
    return jsonify(stats)


@app.route("/api/cities")
def get_cities():
    cities = run_query(
        "SELECT DISTINCT city FROM hotels WHERE status='ACTIVE' ORDER BY city",
        fetchall=True,
    )
    return jsonify([c["city"] for c in (cities or [])])


# ── CHATBOT (Ollama AI) ───────────────────────────

import requests as _requests

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:3b"


def get_hotels_context():
    hotels = run_query(
        "SELECT hotel_name, city, score, price_from, amenities FROM hotels WHERE status='ACTIVE' ORDER BY score DESC",
        fetchall=True,
    ) or []
    lines = []
    for h in hotels:
        ams = (h.get("amenities") or "").split(",")[:4]
        lines.append(
            f"- {h['hotel_name']} ({h['city']}) | Puan:{h['score']} | "
            f"EUR {h['price_from']}'den | {', '.join(a.strip() for a in ams)}"
        )
    return "\n".join(lines)


def query_ollama(user_message, context):
    system = f"""Sen Book Hotel sitesinin Kıbrıs otel asistanısın.
Kullanıcıya kısa, samimi ve yardımcı cevaplar ver. Maksimum 2-3 cümle.
Türkçe veya İngilizce konuş, kullanıcının diline göre.

Mevcut oteller:
{context}"""

    payload = {
        "model":   OLLAMA_MODEL,
        "prompt":  f"System: {system}\n\nKullanıcı: {user_message}\n\nAsistan:",
        "stream":  False,
        "options": {"temperature": 0.7, "num_predict": 200},
    }
    try:
        resp = _requests.post(OLLAMA_URL, json=payload, timeout=30)
        if resp.status_code == 200:
            return resp.json().get("response", "").strip()
    except Exception:
        pass
    return None


def detect_hotels(message):
    msg = message.lower()
    city_map = {
        "nicosia": "Lefkoşa", "lefkoşa": "Lefkoşa", "lefkosa": "Lefkoşa",
        "kyrenia": "Girne", "girne": "Girne",
        "famagusta": "Gazimağusa", "gazimagusa": "Gazimağusa", "gazimağusa": "Gazimağusa",
        "iskele": "İskele", "baf": "Baf", "paphos": "Baf",
    }
    detected_city = next((v for k, v in city_map.items() if k in msg), None)

    conditions = ["status='ACTIVE'"]
    params = []
    if detected_city:
        conditions.append("(city LIKE %s OR district LIKE %s)")
        params += [f"%{detected_city}%", f"%{detected_city}%"]
    if any(w in msg for w in ["cheap","ucuz","budget","affordable"]):
        conditions.append("price_from <= 350")
    elif any(w in msg for w in ["luxury","lüks","premium","best"]):
        conditions.append("score >= 9.0")
    if any(w in msg for w in ["beach","plaj","deniz","sea"]):
        conditions.append("amenities LIKE '%Beach%'")
    if any(w in msg for w in ["spa","wellness"]):
        conditions.append("amenities LIKE '%Spa%'")
    if any(w in msg for w in ["casino","kumar"]):
        conditions.append("amenities LIKE '%Casino%'")
    if any(w in msg for w in ["kids","family","çocuk","aile"]):
        conditions.append("amenities LIKE '%Kids%'")

    where = " AND ".join(conditions)
    hotels = run_query(
        f"SELECT id,hotel_name,city,score,label,price,price_from,img FROM hotels WHERE {where} ORDER BY score DESC LIMIT 4",
        tuple(params), fetchall=True,
    ) or []

    if not hotels:
        hotels = run_query(
            "SELECT id,hotel_name,city,score,label,price,price_from,img FROM hotels WHERE status='ACTIVE' ORDER BY score DESC LIMIT 3",
            fetchall=True,
        ) or []
    return hotels


@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    data    = request.get_json() or {}
    message = (data.get("message") or "").strip()
    if not message:
        return jsonify(reply="Kıbrıs'ta otel bulmana yardımcı olabilirim! 🏨", hotels=[])

    context  = get_hotels_context()
    ai_reply = query_ollama(message, context)

    if not ai_reply:
        msg = message.lower()
        if any(w in msg for w in ["merhaba","hello","hi","selam"]):
            ai_reply = "Merhaba! Kıbrıs otel asistanınım. Hangi şehirde otel arıyorsunuz? 😊"
        elif any(w in msg for w in ["girne","kyrenia"]):
            ai_reply = "Girne'de harika plaj ve resort oteller var! İşte önerilerim:"
        elif any(w in msg for w in ["iskele","limak","concorde"]):
            ai_reply = "İskele bölgesinde lüks all-inclusive oteller mevcut!"
        elif any(w in msg for w in ["ucuz","cheap","budget"]):
            ai_reply = "Uygun fiyatlı Kıbrıs otelleri buldum:"
        else:
            ai_reply = "Kıbrıs'ın en popüler otellerini sizin için listeledim:"

    hotels = detect_hotels(message)
    return jsonify(reply=ai_reply, hotels=hotels)


@app.route("/api/chatbot/status")
def chatbot_status():
    try:
        resp = _requests.get("http://localhost:11434/api/tags", timeout=3)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            return jsonify(online=True, models=models)
    except Exception:
        pass
    return jsonify(online=False, message="Ollama çalışmıyor.")


if __name__ == "__main__":
    app.run(debug=True)

