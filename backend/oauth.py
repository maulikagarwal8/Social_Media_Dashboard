from flask import Flask, redirect, request, jsonify,Blueprint
from database_model import db,PlatformAccount
from sqlalchemy import func
import requests
import jwt
import base64
import json
import os

api_bp = Blueprint("apis", __name__)

YT_CLIENT_ID = os.getenv("YT_CLIENT_ID")
YT_CLIENT_SECRET = os.getenv("YT_CLIENT_SECRET")
GITHUB_CLIENT_ID=os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET=os.getenv("GITHUB_CLIENT_SECRET")
IG_CLIENT_ID=os.getenv("IG_CLIENT_ID")
IG_REDIRECT_URI=os.getenv("IG_REDIRECT_URI")
IG_CLIENT_SECRET=os.getenv("IG_CLIENT_SECRET")
FB_CLIENT_ID=os.getenv("FB_CLIENT_ID")
FB_CLIENT_SECRET=os.getenv("FB_CLIENT_SECRET")
FB_REDIRECT_URI=os.getenv("FB_REDIRECT_URI")
YT_REDIRECT_URI =os.getenv("YT_REDIRECT_URI")

@api_bp.route("/auth/youtube")
def auth_youtube():
    state = request.args.get("state")
    decoded_state = json.loads(base64.b64decode(state).decode())
    user_id = decoded_state["user_id"]
    url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={YT_CLIENT_ID}"
        f"&redirect_uri={YT_REDIRECT_URI}"
        "&response_type=code"
        "&scope=https://www.googleapis.com/auth/youtube.readonly"
        "&access_type=offline"
        "&prompt=consent"
        f"&userid={user_id}"
    )
    return redirect(url)

@api_bp.route("/youtube/callback")
def callback():
    code = request.args.get("code")
    user_id = request.args.get("state")
    token_res = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": YT_CLIENT_ID,
            "client_secret": YT_CLIENT_SECRET,
            "redirect_uri": YT_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
    ).json()
    access_token = token_res.get("access_token")
    if access_token:
        refresh_token = token_res.get("refresh_token")
        user_res = requests.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={
                "part": "snippet",
                "mine": "true"
            },
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()

        channel = user_res["items"][0]
        channelname = channel["snippet"]["title"]
        # channel_id = channel["id"] # if you want to store
        new_conn = PlatformAccount(
            app_user=user_id,
            platform="youtube",
            platform_username=channelname,
            access_token=access_token,
            is_active=False
        )
        db.session.add(new_conn)
        db.session.commit()
        return redirect(
            f"http://localhost:5000/smd_ai_ver2/frontend/platforms.html?"
            f"status=success"
            f"&platform=youtube"
            f"&input={user_id}"
            f"&username={channelname}"
        )
    else:
        return redirect("http://localhost:5500/smd_ai_ver2/frontend/platforms.html?status=failed")


@api_bp.route("/auth/github", methods=["GET"])
def auth_github():
    state = request.args.get("state")
    decoded_state = json.loads(base64.b64decode(state).decode())
    user_id = decoded_state["user_id"]
    url = (
        "https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}"
        "&scope=read:user"
        f"&state={user_id}"
    )
    return redirect(url)

@api_bp.route("/github/callback")
def github_callback():
    code = request.args.get("code")
    user_id = request.args.get("state")
    token_res = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
    ).json()
    access_token = token_res.get("access_token")
    if access_token:
        refresh_token = token_res.get("refresh_token")
        user_res = requests.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}"
            }
        ).json()
        username = user_res.get("login")
        new_conn = PlatformAccount(
            app_user=user_id,
            platform="github",
            platform_username=username,
            access_token=access_token,
            is_active=False
        )
        db.session.add(new_conn)
        db.session.commit()
        return redirect(
            f"http://localhost:5500/smd_ai_ver2/frontend/platforms.html?"
            f"status=success"
            f"&platform=github"
            f"&input={user_id}"
            f"&username={username}"
        )
    else:
        return redirect("http://localhost:5500/smd_ai_ver2/frontend/platforms.html?status=failed")

@api_bp.route("/auth/instagram")
def auth_instagram():
    state = request.args.get("state")
    decoded_state = json.loads(base64.b64decode(state).decode())
    user_id = decoded_state["user_id"]
    url = (
        "https://api.instagram.com/oauth/authorize"
        f"?client_id={IG_CLIENT_ID}"
        f"&redirect_uri={IG_REDIRECT_URI}"
        "&scope=user_profile,user_media"
        "&response_type=code"
        f"&state={user_id}"
    )
    return redirect(url)

@api_bp.route("/instagram/callback")
def instagram_callback():
    code = request.args.get("code")
    user_id = request.args.get("state")
    token_res = requests.post(
        "https://api.instagram.com/oauth/access_token",
        data={
            "client_id": IG_CLIENT_ID,
            "client_secret": IG_CLIENT_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": IG_REDIRECT_URI,
            "code": code,
        },
    ).json()
    access_token = token_res.get("access_token")
    if access_token:
        refresh_token = token_res.get("refresh_token")
        user_res = requests.get(
            f"https://graph.instagram.com/me",
            params={
                "fields": "id,username",
                "access_token": access_token
            }
        ).json()
        username = user_res.get("username")
        # user_id = user_res.get("id") # store if you want unique accounts based on instagram id's
        new_conn = PlatformAccount(
            app_user=user_id,
            platform="instagram",
            platform_username=username,
            access_token=access_token,
            is_active=False
        )
        db.session.add(new_conn)
        db.session.commit()
        return redirect(
            f"http://localhost:5500/smd_ai_ver2/frontend/platforms.html?"
            f"status=success"
            f"&platform=instagram"
            f"&input={user_id}"
            f"&username={username}"
        )
    else:
        return redirect("http://localhost:5500/smd_ai_ver2/frontend/platforms.html?status=failed")
    

@api_bp.route("/auth/facebook")
def auth_facebook():
    state = request.args.get("state")
    decoded_state = json.loads(base64.b64decode(state).decode())
    user_id = decoded_state["user_id"]
    url = (
        "https://www.facebook.com/v18.0/dialog/oauth?"
        f"client_id={FB_CLIENT_ID}"
        f"&redirect_uri={FB_REDIRECT_URI}"
        "&scope=email,public_profile"
        f"&state={user_id}"
    )
    return redirect(url)

@api_bp.route("/facebook/callback")
def facebook_callback():
    code = request.args.get("code")
    user_id = request.args.get("state")
    token_res = requests.get(
        "https://graph.facebook.com/v18.0/oauth/access_token",
        params={
            "client_id": FB_CLIENT_ID,
            "client_secret": FB_CLIENT_SECRET,
            "redirect_uri": FB_REDIRECT_URI,
            "code": code,
        },
    ).json()
    access_token = token_res.get("access_token")
    if access_token:
        refresh_token = token_res.get("refresh_token")
        user_res = requests.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,name",
                "access_token": access_token
            }
        ).json()
        username = user_res.get("name")
        # user_id = user_res.get("id") # only for unique accounts
        new_conn = PlatformAccount(
            app_user=user_id,
            platform="facebook",
            platform_username=username,
            access_token=access_token,
            is_active=False
        )
        db.session.add(new_conn)
        db.session.commit()
        return redirect(
            f"http://localhost:5500/smd_ai_ver2/frontend/platforms.html?"
            f"status=success"
            f"&platform=facebook"
            f"&input={user_id}"
            f"&username={username}"
        )
    else:
        return redirect("http://localhost:5500/smd_ai_ver2/frontend/platforms.html?status=failed")
    

@api_bp.route("/api/connections", methods=["GET"])
def get_connections():
    try:
        app_user = get_current_user()
        print("APP USER:", app_user)
        if not app_user:
            return jsonify({"error": "Unauthorized"})
        connections = PlatformAccount.query.filter_by(app_user=app_user).all()
        data = {}
        for conn in connections:
            if conn.platform not in data:
                data[conn.platform] = []
            data[conn.platform].append({
                "username": conn.platform_username,
                "active": conn.is_active
            })
        return jsonify(data)
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": "Server error"})

@api_bp.route("/api/set_active", methods=["POST"])
def set_active():
    data = request.json
    platform = data["platform"]
    username = data["username"]
    app_user = get_current_user()
    conn = PlatformAccount.query.filter(
        PlatformAccount.app_user == app_user,
        PlatformAccount.platform == platform,
        func.lower(PlatformAccount.platform_username) == username.lower().strip()
    ).first()
    if not conn:
        return jsonify({"error": "Not found"})
    if conn.is_active:
        conn.is_active = False
    else:
        PlatformAccount.query.filter(
            PlatformAccount.app_user == app_user,
            PlatformAccount.platform == platform,
            PlatformAccount.id != conn.id
        ).update({"is_active": False},synchronize_session=False)
        conn.is_active = True
    db.session.commit()
    db.session.refresh(conn)
    return jsonify({"status": "success"})

@api_bp.route("/api/delete_connection", methods=["POST"])
def delete_connection():
    data = request.json
    platform = data["platform"]
    username = data["username"]
    app_user = get_current_user()
    conn = PlatformAccount.query.filter(
        PlatformAccount.app_user == app_user,
        PlatformAccount.platform == platform,
        func.lower(PlatformAccount.platform_username) == username.strip().lower()
    ).first()
    if conn:
        was_active = conn.is_active
        db.session.delete(conn)
        db.session.commit()
        if was_active:
            another = PlatformAccount.query.filter_by(
                app_user=app_user,
                platform=platform
            ).first()
            if another:
                another.is_active = True
                db.session.commit()
    return jsonify({"status": "deleted"})

def get_current_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    token = auth_header.split(" ")[1]
    decoded = jwt.decode(token, "super-secret-jwt-key-that-can-be-anything", algorithms=["HS256"])
    return decoded["sub"]


@api_bp.route("/api/active_account", methods=["GET"])
def get_active_account():
    platform = request.args.get("platform")
    app_user = get_current_user()
    if not app_user:
        return jsonify({"error": "Unauthorized"})
    conn = PlatformAccount.query.filter_by(
        app_user=app_user,
        platform=platform,
        is_active=True
    ).first()
    if not conn:
        return jsonify({"status": "no_active"})
    return jsonify({
        "status": "success",
        "username": conn.platform_username
    })

