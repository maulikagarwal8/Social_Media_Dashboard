from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database_model import db
from auth import auth_bp
from sqlalchemy import event
from dashboard import dashboard_bp
from analyze import analyze_bp
from oauth import api_bp
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-jwt-key-that-can-be-anything"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 7200

CORS(app, supports_credentials=True)
db.init_app(app)

jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(analyze_bp)
app.register_blueprint(api_bp)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True) 
