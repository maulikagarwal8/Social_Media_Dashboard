import requests
import os
from datetime import datetime
from collections import defaultdict
import numpy as np

API_KEY = os.getenv("GITHUB_API_KEY")
BASE_URL = "https://api.github.com"

headers = {
    "Authorization": f"token {API_KEY}"
}

def fetch_github_user(username):
    url = f"{BASE_URL}/users/{username}"
    res = requests.get(url, headers=headers).json()

    if "message" in res:
        return None

    return {
        "name": res.get("name"),
        "followers": res.get("followers"),
        "following": res.get("following"),
        "public_repos": res.get("public_repos"),
        "created_at": res.get("created_at")
    }


def fetch_github_repo_analytics(username):

    url = f"{BASE_URL}/users/{username}/repos?per_page=50"
    repos = requests.get(url, headers=headers).json()

    repo_data = []
    monthly_repos = defaultdict(int)
    language_distribution = defaultdict(int)

    total_stars = 0
    total_forks = 0
    total_issues = 0
    total_watchers = 0

    for repo in repos:

        stars = repo.get("stargazers_count", 0)
        forks = repo.get("forks_count", 0)
        issues = repo.get("open_issues_count", 0)
        watchers = repo.get("watchers_count", 0)
        size = repo.get("size", 0)
        language = repo.get("language")
        created = repo.get("created_at")

        total_stars += stars
        total_forks += forks
        total_issues += issues
        total_watchers += watchers

        # Monthly repo creation
        if created:
            month = datetime.strptime(created, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m")
            monthly_repos[month] += 1

        # Language distribution
        if language:
            language_distribution[language] += 1

        repo_data.append({
            "name": repo.get("name"),
            "stars": stars,
            "forks": forks,
            "issues": issues,
            "watchers": watchers,
            "size": size,
            "language": language
        })

    return {
        "repo_data": repo_data,
        "totals": {
            "stars": total_stars,
            "forks": total_forks,
            "issues": total_issues,
            "watchers": total_watchers
        },
        "monthly_repos": dict(sorted(monthly_repos.items())),
        "language_distribution": dict(language_distribution)
    }


