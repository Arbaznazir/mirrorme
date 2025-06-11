// MirrorMe Content Script
// Enhanced data capture with political tilt and emotional analysis

(function () {
  "use strict";

  // Enhanced sentiment analysis keywords
  const SENTIMENT_KEYWORDS = {
    positive: [
      "love",
      "great",
      "awesome",
      "amazing",
      "wonderful",
      "excellent",
      "good",
      "happy",
      "joy",
      "best",
      "fantastic",
      "brilliant",
      "perfect",
      "beautiful",
      "incredible",
    ],
    negative: [
      "hate",
      "terrible",
      "awful",
      "worst",
      "bad",
      "horrible",
      "disgusting",
      "angry",
      "sad",
      "disappointed",
      "frustrated",
      "annoying",
      "stupid",
      "ugly",
      "pathetic",
    ],
    political_left: [
      "progressive",
      "liberal",
      "democrat",
      "equality",
      "diversity",
      "climate",
      "healthcare",
      "workers",
      "union",
      "social justice",
      "immigration",
      "Bernie",
      "AOC",
    ],
    political_right: [
      "conservative",
      "republican",
      "freedom",
      "liberty",
      "tradition",
      "second amendment",
      "border",
      "Trump",
      "guns",
      "military",
      "tax cuts",
      "business",
    ],
    neutral: [
      "maybe",
      "perhaps",
      "could",
      "might",
      "unsure",
      "depends",
      "neutral",
      "balanced",
    ],
  };

  // Analyze text for sentiment and political tilt
  function analyzeText(text) {
    if (!text)
      return { sentiment: "neutral", political_tilt: "neutral", confidence: 0 };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {
      positive: 0,
      negative: 0,
      neutral: 0,
      political_left: 0,
      political_right: 0,
    };

    words.forEach((word) => {
      Object.keys(SENTIMENT_KEYWORDS).forEach((category) => {
        if (SENTIMENT_KEYWORDS[category].includes(word)) {
          scores[category]++;
        }
      });
    });

    const totalSentiment = scores.positive + scores.negative + scores.neutral;
    const totalPolitical = scores.political_left + scores.political_right;

    let sentiment = "neutral";
    let political_tilt = "neutral";

    if (totalSentiment > 0) {
      if (scores.positive > scores.negative) sentiment = "positive";
      else if (scores.negative > scores.positive) sentiment = "negative";
    }

    if (totalPolitical > 0) {
      if (scores.political_left > scores.political_right)
        political_tilt = "left";
      else if (scores.political_right > scores.political_left)
        political_tilt = "right";
    }

    const confidence = Math.min(
      1.0,
      ((totalSentiment + totalPolitical) / words.length) * 10
    );

    return { sentiment, political_tilt, confidence };
  }

  // Enhanced Twitter/X tracking
  function trackTwitterActivity() {
    if (
      !window.location.hostname.includes("twitter.com") &&
      !window.location.hostname.includes("x.com")
    )
      return;

    // Track tweets being viewed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Track tweet views
            const tweets = node.querySelectorAll('[data-testid="tweet"]');
            tweets.forEach((tweet) => {
              const tweetText =
                tweet.querySelector('[data-testid="tweetText"]')?.textContent ||
                "";
              const author =
                tweet.querySelector('[data-testid="User-Name"]')?.textContent ||
                "";

              if (tweetText) {
                const analysis = analyzeText(tweetText);
                sendBehaviorData({
                  source: "extension",
                  behavior_type: "tweet_view",
                  category: "social",
                  keywords: extractKeywords(tweetText),
                  content: tweetText.substring(0, 280), // Limit to tweet length
                  author: author,
                  sentiment: analysis.sentiment,
                  political_tilt: analysis.political_tilt,
                  confidence: analysis.confidence,
                  session_duration: null,
                });
              }
            });

            // Track likes/retweets
            const likeButtons = node.querySelectorAll(
              '[data-testid="like"], [data-testid="retweet"]'
            );
            likeButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const tweet = button.closest('[data-testid="tweet"]');
                const tweetText =
                  tweet?.querySelector('[data-testid="tweetText"]')
                    ?.textContent || "";
                const analysis = analyzeText(tweetText);

                sendBehaviorData({
                  source: "extension",
                  behavior_type:
                    button.getAttribute("data-testid") === "like"
                      ? "tweet_like"
                      : "tweet_retweet",
                  category: "social",
                  keywords: extractKeywords(tweetText),
                  content: tweetText.substring(0, 280),
                  sentiment: analysis.sentiment,
                  political_tilt: analysis.political_tilt,
                  confidence: analysis.confidence,
                  session_duration: null,
                });
              });
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Track tweet composition
    const tweetComposer = document.querySelector(
      '[data-testid="tweetTextarea_0"]'
    );
    if (tweetComposer) {
      let compositionTimer;
      tweetComposer.addEventListener("input", () => {
        clearTimeout(compositionTimer);
        compositionTimer = setTimeout(() => {
          const content = tweetComposer.textContent;
          if (content.length > 10) {
            const analysis = analyzeText(content);
            sendBehaviorData({
              source: "extension",
              behavior_type: "tweet_compose",
              category: "social",
              keywords: extractKeywords(content),
              content: content.substring(0, 280),
              sentiment: analysis.sentiment,
              political_tilt: analysis.political_tilt,
              confidence: analysis.confidence,
              session_duration: null,
            });
          }
        }, 2000); // Wait 2 seconds after user stops typing
      });
    }
  }

  // Enhanced YouTube tracking
  function trackYouTubeActivity() {
    if (!window.location.hostname.includes("youtube.com")) return;

    // Track video watches with more detail
    const trackVideoWatch = () => {
      const videoTitle =
        document.querySelector("h1.ytd-video-primary-info-renderer")
          ?.textContent ||
        document.querySelector(".title")?.textContent ||
        "";
      const channelName =
        document.querySelector("#channel-name a")?.textContent ||
        document.querySelector(".ytd-channel-name a")?.textContent ||
        "";
      const description =
        document.querySelector("#description")?.textContent || "";
      const videoId = new URLSearchParams(window.location.search).get("v");

      if (videoTitle && videoId) {
        const analysis = analyzeText(`${videoTitle} ${description}`);
        sendBehaviorData({
          source: "extension",
          behavior_type: "youtube_video_watch",
          category: "entertainment",
          keywords: extractKeywords(videoTitle),
          content: videoTitle,
          video_id: videoId,
          channel: channelName,
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: null,
        });
      }
    };

    // Track when video changes (YouTube SPA)
    let currentVideoId = new URLSearchParams(window.location.search).get("v");
    const checkVideoChange = () => {
      const newVideoId = new URLSearchParams(window.location.search).get("v");
      if (newVideoId && newVideoId !== currentVideoId) {
        currentVideoId = newVideoId;
        setTimeout(trackVideoWatch, 2000); // Wait for DOM to update
      }
    };

    // Monitor URL changes
    setInterval(checkVideoChange, 1000);

    // Initial tracking
    if (window.location.pathname === "/watch") {
      setTimeout(trackVideoWatch, 2000);
    }

    // Track YouTube comments
    const trackComments = () => {
      const comments = document.querySelectorAll("#content-text");
      comments.forEach((comment) => {
        if (!comment.dataset.tracked) {
          comment.dataset.tracked = "true";
          const commentText = comment.textContent || "";
          if (commentText.length > 10) {
            const analysis = analyzeText(commentText);
            sendBehaviorData({
              source: "extension",
              behavior_type: "youtube_comment_view",
              category: "entertainment",
              keywords: extractKeywords(commentText),
              content: commentText.substring(0, 500),
              sentiment: analysis.sentiment,
              political_tilt: analysis.political_tilt,
              confidence: analysis.confidence,
              session_duration: null,
            });
          }
        }
      });
    };

    // Track comments with mutation observer
    const commentObserver = new MutationObserver(() => {
      setTimeout(trackComments, 1000);
    });

    const commentsSection = document.querySelector("#comments");
    if (commentsSection) {
      commentObserver.observe(commentsSection, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Enhanced keyword extraction
  function extractKeywords(text) {
    if (!text) return [];

    const stopWords = new Set([
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "a",
      "an",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 15);

    return [...new Set(words)];
  }

  // Track search queries on search engines
  function captureSearchQueries() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // Google search with enhanced analysis
    if (hostname.includes("google.com") && url.includes("/search")) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      if (query) {
        const analysis = analyzeText(query);
        sendBehaviorData({
          source: "extension",
          behavior_type: "search",
          category: "search",
          keywords: query.split(" ").filter((word) => word.length > 2),
          content: query,
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: null,
        });
      }
    }

    // YouTube search with enhanced analysis
    if (hostname.includes("youtube.com") && url.includes("/results")) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("search_query");
      if (query) {
        const analysis = analyzeText(query);
        sendBehaviorData({
          source: "extension",
          behavior_type: "search",
          category: "entertainment",
          keywords: query.split(" ").filter((word) => word.length > 2),
          content: query,
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: null,
        });
      }
    }

    // Reddit search with enhanced analysis
    if (hostname.includes("reddit.com") && url.includes("/search")) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      if (query) {
        const analysis = analyzeText(query);
        sendBehaviorData({
          source: "extension",
          behavior_type: "search",
          category: "social",
          keywords: query.split(" ").filter((word) => word.length > 2),
          content: query,
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: null,
        });
      }
    }
  }

  // Extract keywords from page content
  function extractPageKeywords() {
    const title = document.title;
    const metaDescription =
      document.querySelector('meta[name="description"]')?.content || "";
    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map((h) => h.textContent)
      .join(" ");

    const text = `${title} ${metaDescription} ${headings}`;
    return extractKeywords(text);
  }

  // Send behavior data to background script
  function sendBehaviorData(data) {
    chrome.runtime.sendMessage({
      action: "storeBehaviorData",
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Track page engagement
  let pageStartTime = Date.now();
  let isPageVisible = true;

  // Track page visibility
  document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;
    if (!isPageVisible) {
      // Page became hidden, record engagement time
      const engagementTime = Date.now() - pageStartTime;
      if (engagementTime > 10000) {
        // More than 10 seconds
        const pageContent = document.body.textContent || "";
        const analysis = analyzeText(pageContent.substring(0, 1000)); // Analyze first 1000 chars

        sendBehaviorData({
          source: "extension",
          behavior_type: "engagement",
          category: categorizeCurrentPage(),
          keywords: extractPageKeywords(),
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: Math.floor(engagementTime / 1000),
        });
      }
    } else {
      // Page became visible again
      pageStartTime = Date.now();
    }
  });

  // Categorize current page
  function categorizeCurrentPage() {
    const hostname = window.location.hostname;
    const categories = {
      technology: [
        "github.com",
        "stackoverflow.com",
        "techcrunch.com",
        "wired.com",
      ],
      social: [
        "facebook.com",
        "twitter.com",
        "x.com",
        "instagram.com",
        "linkedin.com",
        "reddit.com",
      ],
      news: ["cnn.com", "bbc.com", "nytimes.com", "reuters.com"],
      entertainment: ["youtube.com", "netflix.com", "spotify.com", "twitch.tv"],
      education: ["coursera.org", "edx.org", "khanacademy.org", "udemy.com"],
      shopping: ["amazon.com", "ebay.com", "etsy.com"],
      health: ["webmd.com", "mayoclinic.org", "healthline.com"],
      finance: ["mint.com", "robinhood.com", "coinbase.com"],
    };

    for (const [category, domains] of Object.entries(categories)) {
      if (domains.some((domain) => hostname.includes(domain))) {
        return category;
      }
    }

    return "general";
  }

  // Initialize content script
  function init() {
    // Capture search queries on page load
    setTimeout(captureSearchQueries, 1000);

    // Initialize platform-specific tracking
    setTimeout(() => {
      trackTwitterActivity();
      trackYouTubeActivity();
    }, 2000);

    // Track clicks on search results (Google)
    if (window.location.hostname.includes("google.com")) {
      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (link && link.href && !link.href.includes("google.com")) {
          sendBehaviorData({
            source: "extension",
            behavior_type: "search_click",
            category: "search",
            keywords: [new URL(link.href).hostname],
            sentiment: "neutral",
            political_tilt: "neutral",
            confidence: 0,
            session_duration: null,
          });
        }
      });
    }

    // Track form submissions (search forms)
    document.addEventListener("submit", (event) => {
      const form = event.target;
      const searchInput = form.querySelector(
        'input[type="search"], input[name*="search"], input[name*="query"], input[name="q"]'
      );

      if (searchInput && searchInput.value.trim()) {
        const analysis = analyzeText(searchInput.value);
        sendBehaviorData({
          source: "extension",
          behavior_type: "search",
          category: categorizeCurrentPage(),
          keywords: searchInput.value
            .split(" ")
            .filter((word) => word.length > 2),
          content: searchInput.value,
          sentiment: analysis.sentiment,
          political_tilt: analysis.political_tilt,
          confidence: analysis.confidence,
          session_duration: null,
        });
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
