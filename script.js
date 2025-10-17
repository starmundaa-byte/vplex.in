// ===== Category click handling =====
const categories = document.querySelectorAll(".category");

categories.forEach(cat => {
  cat.addEventListener("click", () => {
    document.querySelector(".category.active")?.classList.remove("active");
    cat.classList.add("active");

    const category = cat.dataset.category;
    alert(`Fetch videos for: ${category}`); // later will connect to API
  });
});

// ===== Horizontal scroll buttons =====
const categoryList = document.getElementById("categoryList");
document.querySelector(".cat-arrow.left").addEventListener("click", () => {
  categoryList.scrollBy({ left: -200, behavior: "smooth" });
});
document.querySelector(".cat-arrow.right").addEventListener("click", () => {
  categoryList.scrollBy({ left: 200, behavior: "smooth" });
});

const API_KEY = "AIzaSyCxHN_LvucVaJXAnlgABDM78nbTBVP1Ios"; // 🔑 Replace this with your real key
const videoContainer = document.getElementById("videoContainer");

// Fetch most popular videos
async function fetchVideos() {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=IN&maxResults=30&key=${API_KEY}`
    );
    const data = await res.json();
    await showVideos(data.items); // use await because showVideos is async
  } catch (err) {
    console.error("Error fetching videos:", err);
    videoContainer.innerHTML = "<p>Error loading videos.</p>";
  }
}

// Display videos on home page
async function showVideos(videos) {
  videoContainer.innerHTML = "";

  for (const video of videos) {
    const { title, channelId, channelTitle, thumbnails, publishedAt } = video.snippet;
    const { viewCount } = video.statistics;
    const duration = formatDuration(video.contentDetails.duration);

    // Fetch channel logo
    const channelLogo = await getChannelLogo(channelId);

    const uploadTime = timeSince(new Date(publishedAt));
    const views = formatViews(viewCount);

    // ← Video card element
    const videoCardEl = document.createElement("div");
    videoCardEl.classList.add("video-card");
    videoCardEl.innerHTML = `
      <div class="thumbnail-container">
        <img src="${thumbnails.medium.url}" alt="${title}">
        <span class="duration">${duration}</span>
      </div>
      <div class="video-info">
        <img class="channel-logo" src="${channelLogo}" alt="${channelTitle}">
        <div class="video-text">
          <p class="video-title">${title}</p>
          <p class="video-meta">${channelTitle}</p>
          <p class="video-meta">${views} • ${uploadTime}</p>
        </div>
      </div>
    `;

    // Click to go to watch page
    videoCardEl.addEventListener("click", () => {
      window.location.href = `watch.html?id=${video.id}`;
    });

    videoContainer.appendChild(videoCardEl);
  }
}

// Get channel logo
async function getChannelLogo(channelId) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${API_KEY}`
  );
  const data = await res.json();
  return data.items[0].snippet.thumbnails.default.url;
}

// Format ISO 8601 duration → e.g. "PT5M30S" → "5:30"
function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

// Convert views → e.g. 3456789 → 3.4M views
function formatViews(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M views";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K views";
  return num + " views";
}

// Convert date → e.g. 3 days ago
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
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

// Initialize
fetchVideos();
