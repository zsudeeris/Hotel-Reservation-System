from flask import Flask, render_template, jsonify, request
from db import get_connection

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/hotels")
def hotels_page():
    return render_template("hotels.html")


@app.route("/api/hotels", methods=["GET"])
def get_hotels():
    city = request.args.get("city")

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    if city:
        query = """
            SELECT * FROM hotels
            WHERE status = 'ACTIVE'
            AND city LIKE %s
        """
        cursor.execute(query, (f"%{city}%",))
    else:
        query = """
            SELECT * FROM hotels
            WHERE status = 'ACTIVE'
        """
        cursor.execute(query)

    hotels = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(hotels)


@app.route("/api/hotels/<int:hotel_id>/rooms", methods=["GET"])
def get_hotel_rooms(hotel_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT * FROM rooms
        WHERE hotel_id = %s
        AND status = 'ACTIVE'
    """

    cursor.execute(query, (hotel_id,))
    rooms = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rooms)


@app.route("/api/search-rooms", methods=["GET"])
def search_available_rooms():
    city = request.args.get("city")
    check_in = request.args.get("check_in")
    check_out = request.args.get("check_out")
    guests = request.args.get("guests")

    if not city or not check_in or not check_out or not guests:
        return jsonify({
            "success": False,
            "message": "City, check-in date, check-out date and guests are required."
        }), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT 
            rooms.id AS room_id,
            rooms.room_number,
            rooms.room_type,
            rooms.capacity,
            rooms.price_per_night,
            rooms.description AS room_description,
            hotels.id AS hotel_id,
            hotels.hotel_name,
            hotels.city,
            hotels.address
        FROM rooms
        JOIN hotels ON rooms.hotel_id = hotels.id
        WHERE hotels.status = 'ACTIVE'
        AND rooms.status = 'ACTIVE'
        AND hotels.city LIKE %s
        AND rooms.capacity >= %s
        AND rooms.id NOT IN (
            SELECT room_id
            FROM reservations
            WHERE status = 'CONFIRMED'
            AND check_in_date < %s
            AND check_out_date > %s
        )
    """

    cursor.execute(query, (f"%{city}%", guests, check_out, check_in))
    rooms = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "rooms": rooms
    })


@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()

    customer_id = data.get("customer_id", 1)
    hotel_id = data.get("hotel_id")
    room_id = data.get("room_id")
    check_in_date = data.get("check_in_date")
    check_out_date = data.get("check_out_date")
    guest_count = data.get("guest_count")
    total_price = data.get("total_price")

    if not hotel_id or not room_id or not check_in_date or not check_out_date or not guest_count:
        return jsonify({
            "success": False,
            "message": "Missing reservation information."
        }), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    check_query = """
        SELECT *
        FROM reservations
        WHERE room_id = %s
        AND status = 'CONFIRMED'
        AND check_in_date < %s
        AND check_out_date > %s
    """

    cursor.execute(check_query, (room_id, check_out_date, check_in_date))
    existing_reservation = cursor.fetchone()

    if existing_reservation:
        cursor.close()
        conn.close()
        return jsonify({
            "success": False,
            "message": "This room is not available for selected dates."
        }), 400

    insert_query = """
        INSERT INTO reservations
        (customer_id, hotel_id, room_id, check_in_date, check_out_date, guest_count, total_price, reservation_source)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'MANUAL')
    """

    cursor.execute(insert_query, (
        customer_id,
        hotel_id,
        room_id,
        check_in_date,
        check_out_date,
        guest_count,
        total_price
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Reservation created successfully."
    })


@app.route("/api/manager/<int:manager_id>/hotels", methods=["GET"])
def get_manager_hotels(manager_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT * FROM hotels
        WHERE manager_id = %s
    """

    cursor.execute(query, (manager_id,))
    hotels = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(hotels)


@app.route("/api/manager/hotels", methods=["POST"])
def create_hotel():
    data = request.get_json()

    manager_id = data.get("manager_id")
    hotel_name = data.get("hotel_name")
    city = data.get("city")
    address = data.get("address")
    description = data.get("description")

    if not manager_id or not hotel_name or not city:
        return jsonify({
            "success": False,
            "message": "Manager ID, hotel name and city are required."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO hotels
        (manager_id, hotel_name, city, address, description)
        VALUES (%s, %s, %s, %s, %s)
    """

    cursor.execute(query, (
        manager_id,
        hotel_name,
        city,
        address,
        description
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Hotel created successfully."
    })


@app.route("/api/manager/rooms", methods=["POST"])
def create_room():
    data = request.get_json()

    hotel_id = data.get("hotel_id")
    room_number = data.get("room_number")
    room_type = data.get("room_type")
    capacity = data.get("capacity")
    price_per_night = data.get("price_per_night")
    description = data.get("description")

    if not hotel_id or not room_number or not room_type or not capacity or not price_per_night:
        return jsonify({
            "success": False,
            "message": "Hotel ID, room number, room type, capacity and price are required."
        }), 400

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO rooms
        (hotel_id, room_number, room_type, capacity, price_per_night, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    cursor.execute(query, (
        hotel_id,
        room_number,
        room_type,
        capacity,
        price_per_night,
        description
    ))

    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Room created successfully."
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)