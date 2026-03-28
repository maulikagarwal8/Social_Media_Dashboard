from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from available_platform.youtube_service import extract_channel_id,get_channel_stats,get_recent_video_ids,get_video_stats,iso_duration_to_seconds
from available_platform.github_service import fetch_github_repo_analytics,fetch_github_user
from available_platform.instagram_service import x1,extract_account_details,extract_post_data,generate_analytics
from available_platform.facebook_service import x1,extract_account_details,extract_post_data,generate_analytics
from strategy_engine import generate_strategy
from database_model import db,ProcessedAnalytics
from sqlalchemy.orm.attributes import flag_modified
from oauth import get_current_user

analyze_bp = Blueprint("analyze", __name__)

@analyze_bp.route("/api/analyze/<platform>", methods=["POST"])
@jwt_required()
def analyze_platform(platform):
    data = request.json
    data_metrics={}
    if platform == "youtube":
        new_metrics= analyze_youtube(data)
        temp_metrics=new_metrics.get_json()
        data_metrics = {
            'Subscribers':temp_metrics['channel']['subs'],
            'Views':temp_metrics['channel']['views'],
            'Insights':temp_metrics['insights']
        }
    elif platform == "github":
        new_metrics= analyze_github(data)
        temp_metrics=new_metrics.get_json()
        data_metrics = {
            'Followers':temp_metrics['profile']['followers'],
            'PublicRepos':temp_metrics['profile']['public_repos'],
            'Stars':temp_metrics['stats']['stars'],
            'Forks':temp_metrics['stats']['forks']
        }
    elif platform == "instagram":
        new_metrics= analyze_instagram(data)
        temp_metrics=new_metrics.get_json()
        data_metrics = {
            'Followers':temp_metrics['followers'],
            'TotalPosts':temp_metrics['total_posts'],
            'EngagementRate':temp_metrics['engagement_rate'],
            'PostingHours':temp_metrics['posting_hours']
        }
    elif platform == "facebook":
        new_metrics= analyze_facebook(data)
        temp_metrics=new_metrics.get_json()
        data_metrics = {
            'Followers':temp_metrics['followers'],
            'TotalPosts':temp_metrics['total_posts'],
            'EngagementRate':temp_metrics['engagement_rate'],
            'PostingHours':temp_metrics['posting_hours']
        }
    else:
        return jsonify({"error": "Unsupported platform"}), 400
    
    record = ProcessedAnalytics.query.filter_by(
        app_user=get_current_user(),
        platform=platform,
        username=data['input1']
    ).first()
    if record:
        compared = compare_metrics(record.metrics, data_metrics)
        record.metrics = compared
    else:
        compared = compare_metrics({}, data_metrics)
        record = ProcessedAnalytics(
            app_user=get_current_user(),
            platform=platform,
            username=data['input1'],
            metrics=compared
        )
        db.session.add(record)
    flag_modified(record, "metrics") 
    db.session.commit()
    return jsonify({
        "new_metrics":temp_metrics,
        "difference_metrics":compared
    })

def analyze_youtube(data):
    user = get_jwt_identity()
    channel_input=data
    if not channel_input:
        return jsonify({"error": "Channel input required"}), 400
    channel_id = extract_channel_id(channel_input)
    if not channel_id:
        return jsonify({"error": "Invalid channel input"}), 400
    channel = get_channel_stats(channel_id)
    if not channel:
        return jsonify({"error": "Channel not found"}), 404
    video_ids = get_recent_video_ids(channel_id, max_results=20)
    if not video_ids:
        return jsonify({"error": "No videos found"}), 404
    videos = get_video_stats(video_ids)
    views = []
    likes = []
    comments = []
    durations = []
    dates = []
    engagement_per_video = []
    scatter_data = []

    for v in videos:
        stats = v.get("statistics", {})
        snippet = v.get("snippet", {})
        content = v.get("contentDetails", {})
        view = int(stats.get("viewCount", 0))
        like = int(stats.get("likeCount", 0))
        comment = int(stats.get("commentCount", 0))
        duration = iso_duration_to_seconds(content.get("duration", "PT0S"))
        date = snippet.get("publishedAt", "")[:10]

        views.append(view)
        likes.append(like)
        comments.append(comment)
        durations.append(duration)
        dates.append(date)
        engagement = round((like + comment) / view * 100, 2) if view > 0 else 0
        engagement_per_video.append(engagement)

        scatter_data.append({
            "x": view,
            "y": like
        })

    total_views = sum(views)
    total_likes = sum(likes)
    total_comments = sum(comments)

    insights = {
        "avg_views": total_views // len(views) if views else 0,
        "avg_likes": total_likes // len(likes) if likes else 0,
        "avg_comments": total_comments // len(comments) if comments else 0,
        "engagement_rate": round(
            (total_likes + total_comments) / total_views * 100, 2
        ) if total_views > 0 else 0,
        "best_video_views": max(views) if views else 0,
        "worst_video_views": min(views) if views else 0
    }
    ai_strategy=generate_strategy(data={"insights":insights},platform="youtube")
    return jsonify({
        "channel": {
            "title": channel["snippet"]["title"],
            "subs": int(channel["statistics"].get("subscriberCount", 0)),
            "views": int(channel["statistics"].get("viewCount", 0)),
            "videos": int(channel["statistics"].get("videoCount", 0))
        },
        "charts": {
            "views": views,
            "likes": likes,
            "comments": comments,
            "durations": durations,
            "dates": dates,
            "engagement_per_video": engagement_per_video,
            "scatter_views_likes": scatter_data,
        },
        "insights": insights,
        "ai_strategy":ai_strategy
    })

def analyze_github(data):
    data=data['input1']
    username=data.split('/')[-1]
    if not username:
        return jsonify({"error": "GitHub username required"}), 400
    user_data = fetch_github_user(username)
    if not user_data:
        return jsonify({"error": "User not found"}), 404
    analytics = fetch_github_repo_analytics(username)
    ai_strategy=generate_strategy(data=[analytics,user_data],platform="github")

    return jsonify({
        "profile": user_data,
        "stats": analytics["totals"],
        "charts": {
            "monthlyRepoLabels": list(analytics["monthly_repos"].keys()),
            "monthlyRepoData": list(analytics["monthly_repos"].values()),
            "languageLabels": list(analytics["language_distribution"].keys()),
            "languageData": list(analytics["language_distribution"].values()),
        },
        "repo_details": analytics["repo_data"],
        "ai_strategy": ai_strategy,
    })

def analyze_instagram(data):
    user_input = data["input1"]
    details_data = x1(user_input, "details")
    posts_data = x1(user_input, "posts")
    account = extract_account_details(details_data)
    posts,hour,hours, content_types = extract_post_data(posts_data)
    analytics = generate_analytics(account, posts,hour, content_types)
    ai_strategy = generate_strategy(data=[account,analytics,hours],platform="instagram")
    insights = {
        "username": account["username"],
        "followers": account["followers"],
        "following": account["following"],
        "total_posts": account["total_posts"],
        "engagement_rate": analytics["engagement_rate"],
        "content_type": analytics["content_type"],
        "posting_hours": analytics["posting_hours"],
        "engagement_trend_chart": analytics["engagement_trend"],
        "likes_comments_chart": analytics["likes_comment_chart"],
        "ai_strategy": ai_strategy
    }

    return jsonify(insights)

def analyze_facebook(data):
    user_input = data["input1"]
    details_data = x1(user_input, "details")
    posts_data = x1(user_input, "posts")
    account = extract_account_details(details_data)
    posts,hour,hours, content_types = extract_post_data(posts_data)
    analytics = generate_analytics(account, posts,hour, content_types)
    ai_strategy = generate_strategy(data=[account,analytics,hours],platform="instagram")
    insights = {
        "username": account["username"],
        "followers": account["followers"],
        "following": account["following"],
        "total_posts": account["total_posts"],
        "engagement_rate": analytics["engagement_rate"],
        "content_type": analytics["content_type"],
        "posting_hours": analytics["posting_hours"],
        "engagement_trend_chart": analytics["engagement_trend"],
        "likes_comments_chart": analytics["likes_comment_chart"],
        "ai_strategy": ai_strategy
    }

    return jsonify(insights)


def compare_metrics(old, new):
    result = {}
    for key,new_val in new.items():
        old_val = old.get(key, 0)

        if isinstance(old_val, dict) and "current" in old_val:
            old_val = old_val["current"]
        else:
            old_val = old_val
        if isinstance(new_val, dict):
            passed_old = old_val if isinstance(old_val, dict) else {}
            result[key] = compare_metrics(passed_old, new_val)
        elif isinstance(new_val, (int, float)):
            old_num = old_val if isinstance(old_val, (int, float)) else 0
            change = new_val - old_num
            result[key] = {
                "current": new_val,
                "change": change,
                "trend": "up" if change > 0 else "down" if change < 0 else "same"
            }
        else:
            result[key]=new_val
    return result

