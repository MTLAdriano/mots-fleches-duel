// Fetches the daily grid from franceinfo via a CORS proxy
// Parses APP_GAME_DATA from the HTML

const PROXY = "https://api.allorigins.win/raw?url=";
const BASE_URL = "https://jeux.franceinfo.fr/mots-fleches";

export async function fetchGrid(date = null) {
  // date format: "2026-06-08"
  const targetDate = date || getTodayDate();
  
  // Try to get the archive URL for the specific date
  const url = date
    ? await findArchiveUrl(targetDate)
    : BASE_URL;

  const res = await fetch(PROXY + encodeURIComponent(url));
  const html = await res.text();
  return parseGameData(html, targetDate);
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

async function findArchiveUrl(date) {
  // The listing page contains links to each day's grid
  const listUrl = `${BASE_URL}/classique/archives`;
  try {
    const res = await fetch(PROXY + encodeURIComponent(listUrl));
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // Find link matching the date
    const links = [...doc.querySelectorAll("a[href*='mots-fleches']")];
    const match = links.find(l => l.href.includes(date.replace(/-/g, "-")));
    if (match) return "https://jeux.franceinfo.fr" + match.getAttribute("href");
  } catch (e) {
    console.warn("Archive lookup failed, using base URL", e);
  }
  return BASE_URL;
}

export function parseGameData(html, date) {
  // Extract APP_GAME_DATA JSON from the script tag
  const match = html.match(/var APP_GAME_DATA = JSON\.parse\('(.+?)'\);/s);
  if (!match) throw new Error("APP_GAME_DATA not found in page");

  // Decode the unicode-escaped JSON string
  const raw = match[1]
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\\'/g, "'");

  const data = JSON.parse(raw);

  return {
    date,
    id: data.id,
    rows: parseInt(data.rows),
    cols: parseInt(data.columns),
    grid: data.grid.map(cell => ({
      id: parseInt(cell.id),
      x: parseInt(cell.x),
      y: parseInt(cell.y),
      dir: cell.dir,       // RB=right then down, BR=down then right, RR=right, BB=down
      def: cell.def,       // La définition
      size: cell.size_word
    })),
    totalWords: data.grid.length
  };
}
