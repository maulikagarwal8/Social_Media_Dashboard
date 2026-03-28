# Social Media Analytics Dashboard

## Project Overview

The Social Media Analytics Dashboard is a full-stack application designed to collect, analyze, and visualize data from multiple platforms and generate metrics.

The goal of this project is to transform raw API data into meaningful insights, visual analytics, and AI-driven strategies that help users make better decisions regarding content creation, engagement, and growth.



## Objective

* Aggregate data from multiple platforms into a single unified dashboard
* Generate automated insights from raw data
* Provide data-driven strategies to improve performance
* Reduce manual effort in analytics and reporting



## Key Features

- Multi-Platform Integration
- Interactive Dashboard
- Clean UI displaying:
- Data Visualization
- AI-Based Strategy Generation
- Engagement rate calculation
- Growth tracking
- Content-type analysis
- Platform comparison
- Historical metrics
- User activity logs
- AI-generated insights


## Tech Stack Used
### Frontend

* HTML, CSS, JavaScript
* Chart.js (for visualization)

### Backend

* Python (Flask)

### Database

* SQLite / PostgreSQL (via SQLAlchemy)


## Project Structure

```
project/
│
├── frontend/
|   |── js/
|   │   ├── auth.js
|   │   ├── dashboard.js
|   │   ├── platform.js
|   │   └── analytics.js
|   |── css/
|   │   ├── style.css
|   │   ├── dashboard_graph.css
|   │   ├── platform.css
|   │   └── analytics.css
│   ├── index.html
│   ├── dashboard.html
│   ├── platforms.html
│   └── analytics.html
│
├── backend/
│   ├── app.py
│   ├── analyse.py
│   ├── auth.py
│   ├── oauth.py
│   ├── dashboard.py
|   ├── database_model.py
│   ├── available_platform/
|   │   ├── youtube_service.py
|   │   ├── github_service.py
|   │   ├── facebook_service.py
|   │   ├── instagram_service.py
│   └── strategy_engine.py
│
├── README.md
└── requirements.txt
```



## How to Run Locally

* Clone the Repository
* Create Virtual Environment(python environment) and activate it
* Install Dependencies

```
pip install -r requirements.txt
```

* Set Environment Variables

Create a `.env` file and add the required environment variables:

```
YT_API_KEY=your_key
INSTA_API_KEY=your_token
GITHUB_API_KEY=your_token
FACEBOOK_API_KEY=your_token
etc..
```

* Run Backend Server

```
python app.py
```

* Open Frontend

```
Open `index.html` in browser
(or use Live Server in VS Code)
```


## Future Enhancements

* Mobile application version
* Cloud deployment (AWS / GCP)
* OAuth-based authentication
* Real-time analytics updates
* Advanced ML models for prediction
* Export reports (PDF/Excel)
* Notification system for performance alerts


## Use Cases of this project

* Content creators optimizing social media strategy
* Developers analyzing GitHub performance
* Businesses tracking digital engagement
* Marketing teams making data-driven decisions


This project demonstrates how data aggregation + analytics + AI insights can transform raw platform data into actionable intelligence,insights,engagement metrics helping businesses and creators make faster and smarter decisions.
