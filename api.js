// api.js
const API_KEY = "AIzaSyCxHN_LvucVaJXAnlgABDM78nbTBVP1Ios"; // replace with your key
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export async function fetchVideos(query = "trending") {
  const url = `${BASE_URL}/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items.map(item => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}
