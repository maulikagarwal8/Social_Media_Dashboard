const raw = localStorage.getItem("analysis");
const platform = localStorage.getItem("platform");

if (!raw) {
  alert("No data found. Analyze again.");
  window.location.href = "analytics.html";
}

const data = JSON.parse(raw);
const ytimg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>`;
const gitimg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577 
                                0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756
                                -1.089-.744.083-.729.083-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 
                                3.492.998.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.333-5.466-5.93 
                                0-1.31.469-2.382 1.236-3.222-.124-.303-.536-1.523.117-3.176 
                                0 0 1.008-.322 3.301 1.23.957-.266 1.984-.399 3.003-.404 
                                1.019.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 
                                3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 
                                1.235 1.912 1.235 3.222 0 4.61-2.807 5.625-5.479 
                                5.92.43.372.814 1.103.814 2.222 
                                0 1.606-.014 2.896-.014 3.286 
                                0 .32.192.694.8.576C20.565 21.796 24 17.296 24 12 
                                24 5.37 18.63 0 12 0z"/>
              </svg>`;
const instaimg = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>`;

if (platform == "youtube") document.getElementById("plt").innerHTML = ytimg + " " + platform.charAt(0).toUpperCase() + platform.slice(1);
else if (platform == "github") document.getElementById("plt").innerHTML = gitimg + " " + platform.charAt(0).toUpperCase() + platform.slice(1);
else if (platform == "instagram") document.getElementById("plt").innerHTML = instaimg + " " + platform.charAt(0).toUpperCase() + platform.slice(1);

function gotoplatforms(){
  window.location.href = "./platforms.html";
}
function toggleDropdown() {
  const dm=document.getElementById("dropdownMenu");
  if(dm.style.display==='block')dm.style.display='none';
  else dm.style.display='block';
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("analysis");
  window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
}

function getUsernameFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = token.split(".")[1];
  const decoded = JSON.parse(atob(payload));
  return decoded.username || decoded.sub;
}

document.addEventListener("DOMContentLoaded", () => {
  username = getUsernameFromToken();
  if (!username) {
    window.location.href = "http://localhost:5500/smd_ai_ver2/frontend/index.html";
    return;
  }
  username = username.charAt(0).toUpperCase() + username.slice(1);
  document.getElementById("userdisplay").textContent = `${username}`;
});

const metricsContainer = document.getElementById("metricsContainer");
metricsContainer.innerHTML = "";
const chartsContainer = document.getElementById("chartsContainer");
chartsContainer.innerHTML = "";

function createMetricCard(label, value, diff = 0, trend = 'same') {
  let toggle;
  if (label === 'Creator Name') toggle = 'none';
  return `
        <div class="metric-card ${label === 'Creator Name' ? "wide1" : ""}">
            <p>${label}</p>
            <h2>${value ?? "--"}</h2>
            <h3 style='font-weight:300;align-items:center;display:${toggle}'>
              ${trend === 'up' ? "▲" 
              : trend === 'down' ? "▼ "
              : `<svg width="20" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>`} 
              ${diff}</h3>
        </div>
    `;
}

function createChartCard(title, id, description) {
  return `
    <div class="card ${id === 'repoSizeBubble' ? "chart-wide" : ""}">
      <h3>${title}</h3>
      <h4>${description}</h4>
      <br>
      <canvas id="${id}"></canvas>
    </div>`;
}

if (platform === "youtube") {
  metricsContainer.innerHTML += createMetricCard("Creator Name", data.new_metrics.channel.title);
  metricsContainer.innerHTML += createMetricCard("Subscribers", data.new_metrics.channel.subs, data.difference_metrics.Subscribers.change, data.difference_metrics.Subscribers.trend);
  metricsContainer.innerHTML += createMetricCard("Total Views", data.new_metrics.channel.views, data.difference_metrics.Views.change, data.difference_metrics.Views.trend);
  metricsContainer.innerHTML += createMetricCard("Avg Views / Video", data.new_metrics.insights.avg_views, data.difference_metrics.Insights.avg_views.change, data.difference_metrics.Insights.avg_views.trend);
  metricsContainer.innerHTML += createMetricCard("Engagement Rate", data.new_metrics.insights.engagement_rate + "%", data.difference_metrics.Insights.engagement_rate.change, data.difference_metrics.Insights.engagement_rate.trend);
  chartsContainer.innerHTML += createChartCard("Views Distribution Histogram", "viewsHistogram", "Distribution of views across all videos on the channel");
  chartsContainer.innerHTML += createChartCard("RadarChart", "radarChart", "No.");//
  chartsContainer.innerHTML += createChartCard("Engagement Metrics Comparison", "engagementChart", "Comparison of engagement metrics such as likes, comments, and views across videos.");
  chartsContainer.innerHTML += createChartCard("Audience Interaction Breakdown (Likes vs Comments)", "likeCommentChart", "Comparison between the number of likes and comments received per video.");
  chartsContainer.innerHTML += createChartCard("Content Upload Timeline and Views Trend", "uploadTimeline", "Video upload dates plotted v/s the number of views each video receives.");
  chartsContainer.innerHTML += createChartCard("Video Duration vs Performance Analysis", "durationChart", "Comparison between video duration and performance metrics such as views or engagement.");
  chartsContainer.innerHTML += createChartCard("Correlation Between Views and Likes", "scatterChart", "Scatter plot showing the relationship between the number of views and likes for each video.");
  chartsContainer.innerHTML += createChartCard("Viewer Comment Distribution Across Videos", "commentsChart", "Number of comments received on each video.");
  renderYT_Charts();
}
else if (platform === "github") {
  console.log(data);
  metricsContainer.innerHTML += createMetricCard("Creator Name", data.new_metrics.profile.name);
  metricsContainer.innerHTML += createMetricCard("Followers", data.new_metrics.profile.followers, data.difference_metrics.Followers.change, data.difference_metrics.Followers.trend);
  // metricsContainer.innerHTML += createMetricCard("Following", data.new_metrics.profile.following); //if want then remove comment
  metricsContainer.innerHTML += createMetricCard("Public Repos", data.new_metrics.profile.public_repos, data.difference_metrics.PublicRepos.change, data.difference_metrics.PublicRepos.trend);
  metricsContainer.innerHTML += createMetricCard("Total Stars", data.new_metrics.stats.stars, data.difference_metrics.Stars.change, data.difference_metrics.Stars.trend);
  metricsContainer.innerHTML += createMetricCard("Total Forks", data.new_metrics.stats.forks, data.difference_metrics.Forks.change, data.difference_metrics.Forks.trend);
  chartsContainer.innerHTML += createChartCard("Repository Creation Trend Over Time", "monthlyReposChart", "Number of repositories created each month.");
  chartsContainer.innerHTML += createChartCard("RadarChart", "radarChart", "No.");//
  // chartsContainer.innerHTML += createChartCard("Repository Popularity Based on Star Count", "starsBarChart", "Number of stars received by each repository.");
  chartsContainer.innerHTML += createChartCard("Repository Fork Distribution", "forksBarChart", "Number of forks for each repository.");
  chartsContainer.innerHTML += createChartCard("Repository Issue Activity", "issuesBarChart", "Number of open/total issues per repository.");
  chartsContainer.innerHTML += createChartCard("Correlation Between Stars and Forks", "starsForksScatter", "Scatter plot comparing stars and forks for repositories.");
  chartsContainer.innerHTML += createChartCard("Programming Language Usage Distribution", "languagePieChart", "Percentage/count of programming languages used across repositories.");
  chartsContainer.innerHTML += createChartCard("Repository Size vs Project Impact", "repoSizeBubble", "Bubble chart showing repository size along with other metrics (stars and forks).");
  renderGitHubCharts();
}
else if (platform === "instagram") {
  data.new_metrics.username = data.new_metrics.username.charAt(0).toUpperCase() + data.new_metrics.username.slice(1);
  metricsContainer.innerHTML += createMetricCard("Creator Name", data.new_metrics.username);
  metricsContainer.innerHTML += createMetricCard("Followers", data.new_metrics.followers,data.compared.Followers.change,data.compared.Followers.trend);
  metricsContainer.innerHTML += createMetricCard("Following", data.new_metrics.following);
  metricsContainer.innerHTML += createMetricCard("Total Posts", data.new_metrics.total_posts,data.compared.total_posts.change,data.compared.total_posts.trend);
  metricsContainer.innerHTML += createMetricCard("Engagement Rate", Math.round(data.new_metrics.engagement_rate) + ' %',data.compared.engagement_rate.change,data.compared.engagement_rate.trend);
  chartsContainer.innerHTML += createChartCard("Content Type Performance Distribution", "contentTypeChart", "Distribution of posts by type (Image, Video, Reel, Carousel).");
  chartsContainer.innerHTML += createChartCard("Post Engagement Trend Over Time", "postingHourChart", "Engagement (likes + comments) of posts across different posting dates.");
  chartsContainer.innerHTML += createChartCard("Content Publishing Time Distribution", "engagementTrendChart", "Number of posts published during each hour of the day.");
  chartsContainer.innerHTML += createChartCard("User Interaction Breakdown", "likesCommentsChart", "Comparison between likes and comments received on posts.");
  renderInstaCharts();
}
else if (platform === "facebook") {
  metricsContainer.innerHTML += createMetricCard("Creator Name", data.new_metrics.username);
  metricsContainer.innerHTML += createMetricCard("Followers", data.new_metrics.followers,data.compared.Followers.change,data.compared.Followers.trend);
  metricsContainer.innerHTML += createMetricCard("Following", data.new_metrics.following);
  metricsContainer.innerHTML += createMetricCard("Total Posts", data.new_metrics.total_posts,data.compared.TotalPosts.change,data.compared.TotalPosts.trend);
  metricsContainer.innerHTML += createMetricCard("Engagement Rate", Math.round(data.new_metrics.engagement_rate) + ' %',data.compared.EngagementRate.change,data.compared.EngagementRate.trend);
  chartsContainer.innerHTML += createChartCard("Content Type Performance Distribution", "contentTypeChart", "Distribution of posts by type (Image, Video, Reel, Carousel).");
  chartsContainer.innerHTML += createChartCard("Post Engagement Trend Over Time", "postingHourChart", "Engagement (likes + comments) of posts across different posting dates.");
  chartsContainer.innerHTML += createChartCard("Content Publishing Time Distribution", "engagementTrendChart", "Number of posts published during each hour of the day.");
  chartsContainer.innerHTML += createChartCard("User Interaction Breakdown", "likesCommentsChart", "Comparison between likes and comments received on posts.");
  renderFacebookCharts();
}

function renderYT_Charts() {

  /* ---------- COMMON CHART OPTIONS ---------- */
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: true,

    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#e5e7eb",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Videos",
          font: {
            size: 14
          }
        },
        ticks: {
          color: "#9ca3af"
        },
        grid: {
          color: "rgba(255,255,255,0.05)"
        }
      },
      y: {
        title: {
          display: true,
          text: "Count",
          font: {
            size: 14
          }
        },
        ticks: {
          color: "#9ca3af"
        },
        grid: {
          color: "rgba(255,255,255,0.05)"
        }
      }
    }
  };

  /* ---------- All CHARTS ---------- */
  new Chart(document.getElementById("viewsHistogram"), {
    type: "bar",
    data: {
      labels: data.new_metrics.charts.views.map((_, i) => `Video ${i + 1}`),
      datasets: [{
        data: data.new_metrics.charts.views
      }]
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          ...baseOptions.scales.x,
          title: { display: true, text: "Videos", font: { size: 14 } }
        },
        y: {
          ...baseOptions.scales.y,
          title: { display: true, text: "Number of Views", font: { size: 14 } }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  new Chart(document.getElementById("engagementChart"), {
    type: "line",
    data: {
      labels: data.new_metrics.charts.engagement_per_video.map((_, i) => `Video ${i + 1}`),
      datasets: [{
        label: "Engagement Rate (%)",
        data: data.new_metrics.charts.engagement_per_video,
        borderColor: "#3b82f6",
        tension: 0.4,
        fill: true
      }]
    },
    options: baseOptions
  });

  new Chart(document.getElementById("likeCommentChart"), {
    type: "bar",
    data: {
      labels: data.new_metrics.charts.likes.map((_, i) => `Video ${i + 1}`),
      datasets: [
        { label: "Likes", data: data.new_metrics.charts.likes },
        { label: "Comments", data: data.new_metrics.charts.comments }
      ]
    },
    options: {
      ...baseOptions,
      scales: {
        x: { stacked: true, title: { display: true, text: "Videos", font: { size: 14 } } },
        y: { stacked: true, title: { display: true, text: "Total Interaction", font: { size: 14 } } }
      }
    }
  });

  new Chart(document.getElementById("uploadTimeline"), {
    type: "line",
    data: {
      labels: data.new_metrics.charts.dates,
      datasets: [{
        label: "Views per Upload",
        data: data.new_metrics.charts.views,
        borderColor: "#3b82f6",
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      ...baseOptions,
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top"
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Upload Date", font: { size: 14 }
          }
        },
        y: {
          title: {
            display: true,
            text: "Number of Views", font: { size: 14 }
          },
          beginAtZero: true
        }
      }
    }
  });

  new Chart(document.getElementById("durationChart"), {
    type: "bar",
    data: {
      labels: data.new_metrics.charts.durations.map((_, i) => `Video ${i + 1}`),
      datasets: [{
        label: "Video Duration (Seconds)",
        data: data.new_metrics.charts.durations
      }]
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          title: {
            display: true,
            text: "Videos", font: { size: 14 }
          }
        },
        y: {
          title: {
            display: true,
            text: "Duration (Seconds)", font: { size: 14 }
          },
          beginAtZero: true
        }
      }
    }
  });

  new Chart(document.getElementById("scatterChart"), {
    type: "scatter",
    data: {
      datasets: [{
        label: "Views vs Likes Correlation",
        data: data.new_metrics.charts.views.map((v, i) => ({
          x: v,
          y: data.new_metrics.charts.likes[i]
        })),
        pointRadius: 6
      }]
    },
    options: {
      ...baseOptions,
      scales: {
        x: {
          title: {
            display: true,
            text: "Number of Views", font: { size: 14 }
          },
          beginAtZero: true
        },
        y: {
          title: {
            display: true,
            text: "Number of Likes", font: { size: 14 }
          },
          beginAtZero: true
        }
      }
    }
  });

  new Chart(document.getElementById("commentsChart"), {
    type: "line",
    data: {
      labels: data.new_metrics.charts.comments.map((_, i) => `Video ${i + 1}`),
      datasets: [{
        label: "Total Comments per Video:",
        data: data.new_metrics.charts.comments,
        tension: 0.4,
      }]
    },
    options: {
      ...baseOptions,
      scales: {
        y: {
          title: {
            display: true,
            text: "Total comments", font: { size: 14 }
          }
        },
        x: {
          title: {
            display: true,
            text: "Video", font: { size: 14 }
          }
        }
      }
    }
  });

  new Chart(document.getElementById('radarChart'), {
      type: 'radar',
      data: {
          labels: ["Reach", "View Velocity", "Community Fame", "Engagement Rate"],
          datasets: [{
              label: 'Current Performance',
              data:[data.new_metrics.channel.subs/500,data.new_metrics.channel.views/5000,data.new_metrics.insights.avg_views/5,data.new_metrics.insights.engagement_rate*100],
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 2
          }]
      },
      options: {
        responsive:true,
        aspectRatio:1.8,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(74, 74, 74, 0.1)',
              lineWidth: 5
            },
            ticks: {
            showLabelBackdrop: false, 
            font: {
              size: 14,
              weight: 100
            },
            color: 'rgba(67, 169, 238, 0.32)', 
            stepSize: 5000 
          },
          pointLabels: {
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#8e8b8b'
          }
          }
        }
      }
  });

}

function renderGitHubCharts() {
  const repoDetails = data.new_metrics.repo_details;
  const charts = data.new_metrics.charts;

  // Monthly Repo Creation
  new Chart(document.getElementById("monthlyReposChart"), {
    type: "line",
    data: {
      labels: charts.monthlyRepoLabels,
      datasets: [{
        label: "Repositories Created",
        data: charts.monthlyRepoData,
        borderWidth: 3,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Month", font: { size: 14 } }},
        y: { title: { display: true, text: "Repo Counts", font: { size: 14 } },beginAtZero:true } 
      }
    }
  });

  // Language Distribution (Pie)
  new Chart(document.getElementById("languagePieChart"), {
    type: "pie",
    data: {
      labels: charts.languageLabels,
      datasets: [{
        label: "Languages Used",
        data: charts.languageData
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 1.5,
      layout: {
        padding: 40
      }
    }
  });

  // Stars Per Repo (Bar)
  new Chart(document.getElementById("starsBarChart"), {
    type: "bar",
    data: {
      labels: repoDetails.map(r => r.name),
      datasets: [{
        label: "Stars",
        data: repoDetails.map(r => r.stars)
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Repositories", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Stars", font: { size: 14 } } }
      }
    }
  });
  // Forks Per Repo
  new Chart(document.getElementById("forksBarChart"), {
    type: "bar",
    data: {
      labels: repoDetails.map(r => r.name),
      datasets: [{
        label: "Forks",
        data: repoDetails.map(r => r.forks)
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Repositories", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Forks", font: { size: 14 } } }
      }
    }
  });

  //  Issues Per Repo
  new Chart(document.getElementById("issuesBarChart"), {
    type: "bar",
    data: {
      labels: repoDetails.map(r => r.name),
      datasets: [{
        label: "Open Issues",
        data: repoDetails.map(r => r.issues)
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Repositories", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Issues", font: { size: 14 } } }
      }
    }
  });
  //  Stars vs Forks (Scatter)
  new Chart(document.getElementById("starsForksScatter"), {
    type: "scatter",
    data: {
      datasets: [{
        label: "Stars vs Forks",
        data: repoDetails.map(r => ({
          x: r.stars,
          y: r.forks
        }))
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Stars", font: { size: 14 } } },
        y: { title: { display: true, text: "Forks", font: { size: 14 } } }
      }
    }
  });

  //  Repo Size Bubble Chart
  new Chart(document.getElementById("repoSizeBubble"), {
    type: "bubble",
    data: {
      datasets: repoDetails.map(r => ({
        label: r.name,
        data: [{
          x: r.stars,
          y: r.forks,
          r: Math.sqrt(r.size) / 10
        }]
      }))
    },
    options: {
      responsive: true,
      layout: {
        padding: 20
      },
      scales: {
        x: {
          title: { display: true, text: "Stars", font: { size: 14 } },
          beginAtZero: true
        },
        y: {
          title: { display: true, text: "Forks", font: { size: 14 } },
          beginAtZero: true
        }
      }
    }
  });

  new Chart(document.getElementById('radarChart'), {
      type: 'radar',
      data: {
          labels: ["Developer Trust(Followers)", "Project Volume", "Code Popularity", "Community Reach"],
          datasets: [{
              label: 'Current Performance',
              data:[data.new_metrics.profile.followers/50,data.new_metrics.profile.public_repos,data.new_metrics.stats.stars,data.new_metrics.stats.forks],
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 2
          }]
      },
      options: {
        responsive:true,
        aspectRatio:1.6,
        scales: {
          r: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(74, 74, 74, 0.1)',
              lineWidth: 5
            },
            ticks: {
            showLabelBackdrop: false, 
            font: {
              size: 14,
              weight: 100
            },
            color: 'rgba(67, 169, 238, 0.32)', 
            stepSize: 500 
          },
          pointLabels: {
            font: {
              size: 16,
              weight: 'bold'
            },
            color: '#8e8b8b'
          }
          }
        }
      }
  });

}

function renderInstaCharts() {

  new Chart(document.getElementById("contentTypeChart"), {
    type: "pie",
    data: {
      labels: Object.keys(data.new_metrics.content_type),
      datasets: [{
        data: Object.values(data.new_metrics.content_type)
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 1.7,
      layout: {
        padding: 40
      }
    }
  });

  new Chart(document.getElementById("postingHourChart"), {
    type: "bar",
    data: {
      labels: Object.keys(data.new_metrics.posting_hours),
      datasets: [{
        label: "Posts Count",
        data: Object.values(data.new_metrics.posting_hours)
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Days of Month", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Posts", font: { size: 14 } } }
      }
    }
  });


  const labels = data.engagement_trend_chart.map(p => p.date);
  const engagement = data.engagement_trend_chart.map(p => p.engagement);
  new Chart(document.getElementById("engagementTrendChart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Engagement",
        data: engagement
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Days", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Engagement(Likes+Comments)", font: { size: 14 } } }
      }
    }
  });


  const likes = data.likes_comments_chart.map(p => p.likes);
  const comments = data.likes_comments_chart.map(p => p.comments);
  new Chart(document.getElementById("likesCommentsChart"), {
    type: "bar",
    data: {
      labels: likes.map((_, i) => "Post " + (i + 1)),
      datasets: [
        {
          label: "Likes",
          data: likes
        },
        {
          label: "Comments",
          data: comments
        }
      ]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Posts", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Interaction", font: { size: 14 } } }
      }
    }
  });
}

function renderFacebookCharts(){
  
  new Chart(document.getElementById("contentTypeChart"), {
    type: "pie",
    data: {
      labels: Object.keys(data.new_metrics.content_type),
      datasets: [{
        data: Object.values(data.new_metrics.content_type)
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 1.7,
      layout: {
        padding: 40
      }
    }
  });

  new Chart(document.getElementById("postingHourChart"), {
    type: "bar",
    data: {
      labels: Object.keys(data.new_metrics.posting_hours),
      datasets: [{
        label: "Posts Count",
        data: Object.values(data.new_metrics.posting_hours)
      }]
    },
    options: {
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: "Days of Month", font: { size: 14 } } },
        y: { title: { display: true, text: "Total Posts", font: { size: 14 } } }
      }
    }
  });

}

function createAICard(label, value) {
  return `
        <div class="metric-card ">
            <h2 style='font-weight:500'>${label}</h2>
            <h3 style='font-weight:300'>${value ?? "--"}</h3>
        </div>
    `;
}

const ai = data.new_metrics.ai_strategy;
const aiContainer = document.getElementById("aiInsight");
aiContainer.innerHTML += createAICard("Summary of Content", ai.summary);
aiContainer.innerHTML += createAICard("Strengths ", ai.strength);
aiContainer.innerHTML += createAICard("Improvements Needed ", ai.improvement_area);
aiContainer.innerHTML += createAICard("How to do it", ai.action_plan);

