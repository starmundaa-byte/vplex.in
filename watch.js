const API_KEY = ;
const player = document.getElementById("player");
const videoTitle = document.getElementById("videoTitle");
const videoStats = document.getElementById("videoStats");
const channelName = document.getElementById("channelName");
const channelLogo = document.getElementById("channelLogo");
const commentList = document.getElementById("commentList");
const recommendList = document.getElementById("recommendList");

const videoId = new URLSearchParams(window.location.search).get("id");

async function loadVideo() {
  if (!videoId) return;
  player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
  );
  const data = await res.json();
  const video = data.items[0];

  const { title, channelId, channelTitle, publishedAt } = video.snippet;
  const { viewCount } = video.statistics;

  videoTitle.textContent = title;
  videoStats.textContent = `${formatViews(viewCount)} • ${timeSince(
    new Date(publishedAt)
  )}`;

  channelName.textContent = channelTitle;

  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
  );
  const channelData = await channelRes.json();
  channelLogo.src = channelData.items[0].snippet.thumbnails.default.url;

  loadComments();
  loadRecommended();
}

// Load comments
async function loadComments() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${API_KEY}`
  );
  const data = await res.json();
  commentList.innerHTML = data.items
    .map(
      (c) => `
      <div class="comment">
        <p><b>${c.snippet.topLevelComment.snippet.authorDisplayName}</b></p>
        <p>${c.snippet.topLevelComment.snippet.textDisplay}</p>
      </div>`
    )
    .join("");
}

// Recommended + Ads
async function loadRecommended() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=30&key=${API_KEY}`
  );
  const data = await res.json();
  recommendList.innerHTML = "";

  data.items.forEach((vid, i) => {
    // Add ad slot every 5 videos
    if (i % 5 === 0 && i !== 0) {
      recommendList.innerHTML += `<div class="ad-space">Advertisement</div>`;
    }

    recommendList.innerHTML += `
      <div class="recommend-card" onclick="window.location='watch.html?id=${vid.id}'">
        <img class="recommend-thumb" src="${vid.snippet.thumbnails.medium.url}" alt="${vid.snippet.title}">
        <div class="recommend-info">
          <h4>${vid.snippet.title}</h4>
          <p>${vid.snippet.channelTitle}</p>
        </div>
      </div>`;
  });
}

// Utilities
function formatViews(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M views";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K views";
  return num + " views";
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

loadVideo();

