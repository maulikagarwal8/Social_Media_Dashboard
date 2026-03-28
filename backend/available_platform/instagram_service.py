from apify_client import ApifyClient
import requests
from datetime import datetime
from collections import Counter
import os
import pandas as pd

API_KEY = os.getenv("INSTA_API_KEY")
ACTOR=os.getenv("ACTOR")

client = ApifyClient(API_KEY)
def x1(username,rtype):
    if "instagram.com" in username:
        username = username.split("instagram.com/")[1]
    run_input = {
        "directUrls": [f"https://www.instagram.com/{username}/"],
        "resultsType": f"{rtype}",
        "resultsLimit": 3,
        "searchType": "hashtag",
        "searchLimit": 1,
        "addParentData": False,
    }
    run = client.actor(ACTOR).call(run_input=run_input)
    dataset_id = run["defaultDatasetId"]
    items1 = client.dataset(dataset_id).list_items().items
    return items1

def extract_account_details(details_data):
    d = details_data[0]
    return {
        "username": d.get("username"),
        "followers": d.get("followersCount"),
        "following": d.get("followsCount"),
        "total_posts": d.get("postsCount")
    }

def extract_post_data(posts_data):
    posts = []
    hours = []
    content_types = []

    for post in posts_data:
        likes = post.get("likesCount", 0)
        comments = post.get("commentsCount", 0)
        timestamp = post.get("timestamp")
        hour = None
        if timestamp:
            hour = datetime.fromisoformat(timestamp.replace("Z","")).hour
            hours.append(hour)
        media_type = post.get("type")
        content_types.append(media_type)
        posts.append({
            "id": post.get("id"),
            "likes": likes,
            "comments": comments,
            "engagement": likes + comments,
            "timestamp": timestamp,
            "hour": hour,
            "content_type": media_type
        })
    return posts,timestamp,hours,content_types

def generate_analytics(account, posts,hour, content_types):
    followers = account["followers"]
    total_likes = sum(p["likes"] for p in posts)
    total_comments = sum(p["comments"] for p in posts)
    engagement_rate = ((total_likes + total_comments) / followers) * 100 if followers else 0
    # Posting hours distribution
    posting_hours = hour
    # Content type distribution
    content_type_stats = Counter(content_types)
    # Engagement trend
    engagement_trend = [
        {
            "date": datetime.fromisoformat(p["timestamp"].replace("Z","")),
            "engagement": p["engagement"]
        }
        for p in posts
    ]
    # Likes vs comments chart
    likes_comment_chart = [
        {
            "likes": p["likes"],
            "comments": p["comments"]
        }
        for p in posts
    ]
    return {
        "engagement_rate": engagement_rate,
        "posting_hours": posting_hours,
        "content_type": content_type_stats,
        "engagement_trend": engagement_trend,
        "likes_comment_chart": likes_comment_chart
    }




