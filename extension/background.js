// MirrorMe Background Service Worker
// Handles tab tracking, data collection, and sync with backend

const API_BASE_URL = "http://localhost:8000";

// Track active tab and time spent
let activeTabId = null;
let tabStartTime = null;
let behaviorQueue = [];

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("MirrorMe extension installed");

  // Initialize storage
  chrome.storage.local.set({
    isEnabled: true,
    syncEnabled: false,
    authToken: null,
    behaviorData: [],
  });
});

// Tab activation tracking
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await handleTabChange(activeInfo.tabId);
});

// Tab update tracking (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    await handleTabVisit(tab);
  }
});

// Handle tab changes and time tracking
async function handleTabChange(newTabId) {
  // Record time spent on previous tab
  if (activeTabId && tabStartTime) {
    const timeSpent = Date.now() - tabStartTime;
    if (timeSpent > 5000) {
      // Only record if spent more than 5 seconds
      await recordTimeSpent(activeTabId, timeSpent);
    }
  }

  // Set new active tab
  activeTabId = newTabId;
  tabStartTime = Date.now();
}

// Handle tab visits
async function handleTabVisit(tab) {
  const settings = await chrome.storage.local.get(["isEnabled"]);
  if (!settings.isEnabled) return;

  // Extract domain and keywords from URL
  const url = new URL(tab.url);
  const domain = url.hostname;
  const keywords = extractKeywordsFromUrl(url);

  // Skip internal pages
  if (url.protocol === "chrome:" || url.protocol === "chrome-extension:") {
    return;
  }

  const behaviorData = {
    source: "extension",
    behavior_type: "visit",
    category: categorizeWebsite(domain),
    keywords: keywords,
    sentiment: null,
    session_duration: null,
    timestamp: new Date().toISOString(),
  };

  await storeBehaviorData(behaviorData);
}

// Record time spent on a tab
async function recordTimeSpent(tabId, timeSpent) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;

    const url = new URL(tab.url);
    const domain = url.hostname;

    const behaviorData = {
      source: "extension",
      behavior_type: "time_spent",
      category: categorizeWebsite(domain),
      keywords: [domain],
      sentiment: null,
      session_duration: Math.floor(timeSpent / 1000), // Convert to seconds
      timestamp: new Date().toISOString(),
    };

    await storeBehaviorData(behaviorData);
  } catch (error) {
    console.log("Tab no longer exists:", tabId);
  }
}

// Extract keywords from URL
function extractKeywordsFromUrl(url) {
  const keywords = [];

  // Extract from hostname
  const domain = url.hostname.replace("www.", "");
  keywords.push(domain);

  // Extract from path
  const pathParts = url.pathname.split("/").filter((part) => part.length > 2);
  keywords.push(...pathParts);

  // Extract from search params (for search engines)
  if (url.searchParams.has("q")) {
    const query = url.searchParams.get("q");
    keywords.push(...query.split(" ").filter((word) => word.length > 2));
  }

  return keywords.slice(0, 10); // Limit to 10 keywords
}

// Categorize website based on domain
function categorizeWebsite(domain) {
  const categories = {
    technology: [
      "github.com",
      "stackoverflow.com",
      "techcrunch.com",
      "wired.com",
      "ycombinator.com",
    ],
    social: [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
      "reddit.com",
    ],
    news: ["cnn.com", "bbc.com", "nytimes.com", "reuters.com", "npr.org"],
    entertainment: ["youtube.com", "netflix.com", "spotify.com", "twitch.tv"],
    education: ["coursera.org", "edx.org", "khanacademy.org", "udemy.com"],
    shopping: ["amazon.com", "ebay.com", "etsy.com", "shopify.com"],
    health: ["webmd.com", "mayoclinic.org", "healthline.com"],
    finance: ["mint.com", "robinhood.com", "coinbase.com", "bloomberg.com"],
  };

  for (const [category, domains] of Object.entries(categories)) {
    if (domains.some((d) => domain.includes(d))) {
      return category;
    }
  }

  return "general";
}

// Store behavior data locally
async function storeBehaviorData(behaviorData) {
  const storage = await chrome.storage.local.get(["behaviorData"]);
  const existingData = storage.behaviorData || [];

  existingData.push(behaviorData);

  // Keep only last 1000 entries to prevent storage overflow
  if (existingData.length > 1000) {
    existingData.splice(0, existingData.length - 1000);
  }

  await chrome.storage.local.set({ behaviorData: existingData });

  // Try to sync if enabled
  await attemptSync();
}

// Attempt to sync data with backend
async function attemptSync() {
  const settings = await chrome.storage.local.get([
    "syncEnabled",
    "authToken",
    "behaviorData",
  ]);

  if (
    !settings.syncEnabled ||
    !settings.authToken ||
    !settings.behaviorData?.length
  ) {
    return;
  }

  try {
    // Send batch of behavior data
    const response = await fetch(`${API_BASE_URL}/behavior/log-batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.authToken}`,
      },
      body: JSON.stringify({
        logs: settings.behaviorData.slice(-50), // Send last 50 entries
      }),
    });

    if (response.ok) {
      // Clear synced data
      await chrome.storage.local.set({ behaviorData: [] });
      console.log("Behavior data synced successfully");
    }
  } catch (error) {
    console.log("Sync failed:", error);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getBehaviorData") {
    chrome.storage.local.get(["behaviorData"]).then(sendResponse);
    return true;
  }

  if (request.action === "clearData") {
    chrome.storage.local.set({ behaviorData: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "toggleTracking") {
    chrome.storage.local.set({ isEnabled: request.enabled }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "setAuthToken") {
    chrome.storage.local
      .set({
        authToken: request.token,
        syncEnabled: true,
      })
      .then(() => {
        sendResponse({ success: true });
      });
    return true;
  }
});

// Periodic sync (every 5 minutes)
setInterval(attemptSync, 5 * 60 * 1000);
