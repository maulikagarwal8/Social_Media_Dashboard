import requests
import os
import re
from datetime import datetime
from collections import defaultdict

API_KEY = os.getenv("YT_API_KEY")
BASE_URL = "https://www.googleapis.com/youtube/v3"

def extract_channel_id(input_value):
    if not input_value:
        return None
    input_value = input_value['input1'].strip()
    if "youtube.com" in input_value and "/channel/" in input_value:
        return input_value.split("/channel/")[1].split("/")[0]
    if "@" in input_value:
        handle = input_value.split("@")[-1]
        return search_channel_by_name(handle)
    if input_value.startswith("@"):
        return search_channel_by_name(input_value[1:])
    return search_channel_by_name(input_value)

def search_channel_by_name(name):
    url = f"{BASE_URL}/search"
    params = {
        "part": "snippet",
        "q": name,
        "type": "channel",
        "maxResults": 1,
        "key": API_KEY
    }
    try:
        res = requests.get(url, params=params).json()
    except Exception as e:
        print("YouTube API request failed:", e)
        return None

    if "items" not in res or len(res["items"]) == 0:
        print("No channel found for:", name)
        return None
    return res["items"][0]["snippet"]["channelId"]

def fetch_channel_stats(channel_id):
    url = f"{BASE_URL}/channels"
    params = {
    "part": "snippet,statistics",
    "id": channel_id,
    "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    if not res.get("items"):
        return None

    data = res["items"][0]
    return {
    "channel_name": data["snippet"]["title"],
    "subscribers": int(data["statistics"].get("subscriberCount", 0)),
    "views": int(data["statistics"].get("viewCount", 0)),
    "videos": int(data["statistics"].get("videoCount", 0)),
    "thumbnail": data["snippet"]["thumbnails"]["high"]["url"]
    }

def get_channel_stats(channel_id):
    url = f"{BASE_URL}/channels"
    params = {
        "part": "statistics,snippet",
        "id": channel_id,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return res["items"][0]

def get_recent_videos(channel_id, max_results=10):
    url = f"{BASE_URL}/search"
    params = {
        "part": "id",
        "channelId": channel_id,
        "order": "date",
        "type": "video",
        "maxResults": max_results,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return [item["id"]["videoId"] for item in res["items"]]

def get_video_stats(video_ids):
    url = f"{BASE_URL}/videos"
    params = {
        "part": "statistics,snippet,contentDetails",
        "id": ",".join(video_ids),
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return res.get("items", []) #res["items"]

def iso_duration_to_seconds(duration):
    match = re.match(
        r'PT((?P<h>\d+)H)?((?P<m>\d+)M)?((?P<s>\d+)S)?',
        duration
    )
    if not match:
        return 0
    h = int(match.group('h') or 0)
    m = int(match.group('m') or 0)
    s = int(match.group('s') or 0)
    return h*3600 + m*60 + s

def get_recent_video_ids(channel_id, max_results=10):
    url = f"{BASE_URL}/search"
    params = {
        "part": "id",
        "channelId": channel_id,
        "order": "date",
        "type": "video",
        "maxResults": max_results,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return [item["id"]["videoId"] for item in res["items"]]

def generate_insights(channel_stats, videos):
    views = []
    likes = []
    comments = []
    durations = []
    dates = []
    for v in videos:
        stats = v["statistics"]
        snippet = v["snippet"]
        content = v["contentDetails"]

        views.append(int(stats.get("viewCount", 0)))
        likes.append(int(stats.get("likeCount", 0)))
        comments.append(int(stats.get("commentCount", 0)))
        durations.append(iso_duration_to_seconds(content["duration"]))
        dates.append(snippet["publishedAt"][:10])

    total_views = sum(views)
    total_likes = sum(likes)
    total_comments = sum(comments)
    engagement_rate = round((total_likes + total_comments) / total_views * 100, 2) if total_views else 0
    return {
        "summary": {
            "avg_views": total_views // len(views) if views else 0,
            "avg_likes": total_likes // len(likes) if likes else 0,
            "engagement_rate": engagement_rate
        },
        "charts": {
            "views": views,
            "likes": likes,
            "comments": comments,
            "durations": durations,
            "dates": dates,
            "engagement_per_video": [
                round((likes[i] + comments[i]) / views[i] * 100, 2) if views[i] else 0
                for i in range(len(views))
            ]
        }
    }