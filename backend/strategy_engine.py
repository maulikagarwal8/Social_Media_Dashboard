from collections import Counter
def generate_strategy(data, platform):
    response = {
        "platform": platform,
        "summary": "",
        "strength": "",
        "improvement_area": "",
        "action_plan": ""
    }
    try:
        # YOUTUBE STRATEGY
        if platform == "youtube":
            insights = data.get("insights", {})
            avg_views = insights.get("avg_views", 0)
            engagement = insights.get("engagement_rate", 0)
            # Quick inference
            if engagement > 8:
                strength = "High audience engagement"
                improvement = "Increase upload frequency"
                action = "Post 3-4 times weekly and test longer content."
            elif engagement > 4:
                strength = "Moderate engagement"
                improvement = "Improve thumbnails & titles"
                action = "Optimize CTR using better hooks and trending topics."
            else:
                strength = "Low engagement"
                improvement = "Improve content retention"
                action = "Focus on storytelling and stronger content for first 30 seconds."

            response.update({
                "summary": f"Average Views: {avg_views}, Engagement: {engagement}%",
                "strength": strength,
                "improvement_area": improvement,
                "action_plan": action
            })

        # GITHUB STRATEGY
        elif platform == "github":

            stats = data[0]["totals"]
            total_repos = data[1]["public_repos"]
            total_stars = stats["stars"]

            if total_stars > 200:
                strength = "Strong open-source traction"
                improvement = "Promote projects publicly"
                action = "Share repos on LinkedIn and write technical blogs."
            elif total_repos > 10:
                strength = "Good project consistency"
                improvement = "Improve documentation"
                action = "Enhance README, add demos and project explanations."
            else:
                strength = "Early stage profile"
                improvement = "Increase project activity"
                action = "Build 2 quality projects monthly."

            response.update({
                "summary": f"Repos: {total_repos}, Stars: {total_stars}",
                "strength": strength,
                "improvement_area": improvement,
                "action_plan": action
            })

        #INSTAGRAM STRATEGY
        elif platform == "instagram":

            followers = data[0].get("followers", 0)
            posts = data[1].get("posts", [])
            posting_hours = Counter(data[2])
            content_distribution = data[1].get("content_type", {})
            total_likes = sum(p.get("likes", 0) for p in posts)
            total_comments = sum(p.get("comments", 0) for p in posts)

            post_count = len(posts)
            avg_likes = total_likes / post_count if post_count else 0
            avg_comments = total_comments / post_count if post_count else 0

            best_hour = None
            if posting_hours:
                best_hour = max(posting_hours, key=posting_hours.get)

            engagement_rate = data[1].get("engagement_rate",0)
            strengths = []
            if engagement_rate > 5:
                strengths.append("Strong engagement rate compared to average Instagram accounts")
            if "VIDEO" in content_distribution:
                strengths.append("Video/Reel content present which usually drives higher reach")
            if avg_comments > avg_likes * 0.05:
                strengths.append("Audience actively participates in discussions through comments")
            if not strengths:
                strengths.append("Consistent posting behaviour detected")

            improvements = []
            if engagement_rate < 3:
                improvements.append("Overall engagement rate is relatively low")
            if "VIDEO" not in content_distribution:
                improvements.append("Reel or video content is missing which limits reach")
            if avg_comments < avg_likes * 0.02:
                improvements.append("Low comment interaction from audience")
            if best_hour is None:
                improvements.append("Posting time optimization is missing")
            if not improvements:
                improvements.append("Content diversification could further improve reach")

            actions = []
            if best_hour:
                actions.append(
                    f"Schedule posts around {best_hour}:00 since data shows highest engagement during this time"
                )
            actions.append(
                "Use top performing hashtags identified in analytics to increase discoverability"
            )
            actions.append(
                "Maintain a consistent posting schedule to improve algorithm visibility"
            )

            response.update({
                "summary":
                f"The Instagram account has approximately {followers} followers with an "
                f"average engagement of {round(engagement_rate,2)}% per post. "
                f"The account posts mostly {max(content_distribution, key=content_distribution.get)} "
                f"type content and the best engagement occurs around {best_hour}:00 hours.",

                "strength":".".join(strengths),
                "improvement_area":".".join(improvements),
                "action_plan":".".join(actions)
            })
            return response

        else:
            response["summary"] = "Platform not supported yet."
            response["action_plan"] = "Add platform logic in backend."

    except Exception as e:
        print("Strategy Error:", e)
        response["summary"] = "Error generating strategy."

    return response

