from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class PlatformAccount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    app_user = db.Column(db.String(100), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    platform_username = db.Column(db.String(100), nullable=False)
    access_token = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=False)

class ProcessedAnalytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    app_user = db.Column(db.String(50), nullable=False)
    platform = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    metrics = db.Column(db.JSON, nullable=False)
    last_updated = db.Column(db.DateTime, default=db.func.now())
    __table_args__ = (
        db.UniqueConstraint('app_user', 'platform', 'username', name='unique_user_platform'),
    )



class UserActivityLog(db.Model):
    __tablename__ = "user_activity_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    activity_type = db.Column(db.String(100))
    activity_description = db.Column(db.String(300))
    platform = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class HistoricalMetrics(db.Model):
    __tablename__ = "historical_metrics"
    id = db.Column(db.Integer, primary_key=True)
    platform_account_id = db.Column(db.Integer, db.ForeignKey("platform_accounts.id"), nullable=False)
    followers = db.Column(db.Integer)
    views = db.Column(db.Integer)
    likes = db.Column(db.Integer)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)

