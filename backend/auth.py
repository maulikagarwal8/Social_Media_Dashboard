from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from database_model import db, User
import bcrypt

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.json

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_pw = bcrypt.hashpw(
        data["password"].encode("utf-8"),
        bcrypt.gensalt()
    )

    user = User(username=data["username"],password=hashed_pw.decode("utf-8"))
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True})


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    print("LOGIN DATA:", data)
    user = User.query.filter_by(username=data["username"]).first()
    print("USER FOUND:", user)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(
        data["password"].encode("utf-8"),
        user.password.encode("utf-8")
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    # CREATE JWT
    access_token = create_access_token(identity=user.username)

    return jsonify({
        "access_token": access_token,
        "username": user.username
    }), 200
