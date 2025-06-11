// MirrorMe Extension Popup JavaScript

const API_BASE_URL = "http://localhost:8000";

class MirrorMePopup {
  constructor() {
    this.currentSection = "login";
    this.authToken = null;
    this.isLoggedIn = false;

    this.init();
  }

  async init() {
    await this.loadStoredData();
    this.setupEventListeners();
    this.determineInitialView();
    this.updateUI();
  }

  async loadStoredData() {
    const storage = await chrome.storage.local.get([
      "authToken",
      "syncEnabled",
      "isEnabled",
      "behaviorData",
    ]);

    this.authToken = storage.authToken;
    this.isLoggedIn = !!this.authToken;
    this.syncEnabled = storage.syncEnabled || false;
    this.trackingEnabled = storage.isEnabled !== false;
    this.behaviorData = storage.behaviorData || [];
  }

  determineInitialView() {
    if (this.isLoggedIn) {
      this.currentSection = "dashboard";
    } else {
      this.currentSection = "login";
    }
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-btn[data-section]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const section = e.currentTarget.dataset.section;
        this.showSection(section);
      });
    });

    // Login form
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Register form
    document.getElementById("registerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Auth buttons
    document.getElementById("registerBtn").addEventListener("click", () => {
      this.showSection("register");
    });

    document.getElementById("backToLoginBtn").addEventListener("click", () => {
      this.showSection("login");
    });

    document.getElementById("skipBtn").addEventListener("click", () => {
      this.showSection("dashboard");
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.handleLogout();
    });

    // Action buttons
    document.getElementById("analyzeBtn").addEventListener("click", () => {
      this.analyzePersona();
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportData();
    });

    // Settings toggles
    document
      .getElementById("trackingToggle")
      .addEventListener("change", (e) => {
        this.toggleTracking(e.target.checked);
      });

    document.getElementById("syncToggle").addEventListener("change", (e) => {
      this.toggleSync(e.target.checked);
    });

    // Data management
    document.getElementById("clearDataBtn").addEventListener("click", () => {
      this.clearLocalData();
    });
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.add("hidden");
    });

    // Show target section
    document.getElementById(`${sectionName}Section`).classList.remove("hidden");

    // Update navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    this.currentSection = sectionName;

    // Load section-specific data
    if (sectionName === "dashboard") {
      this.loadDashboardData();
    }
  }

  async handleLogin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    this.showLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.access_token;
        this.isLoggedIn = true;

        // Store token
        await chrome.storage.local.set({
          authToken: this.authToken,
          syncEnabled: true,
        });

        // Send token to background script
        chrome.runtime.sendMessage({
          action: "setAuthToken",
          token: this.authToken,
        });

        this.showToast("Successfully logged in!", "success");
        this.showSection("dashboard");
        this.updateStatusIndicator();
      } else {
        const error = await response.json();
        this.showToast(error.detail || "Login failed", "error");
      }
    } catch (error) {
      this.showToast("Connection error. Please try again.", "error");
    }

    this.showLoading(false);
  }

  async handleRegister() {
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    this.showLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        this.showToast("Account created! Please sign in.", "success");
        this.showSection("login");

        // Pre-fill login form
        document.getElementById("email").value = email;
      } else {
        const error = await response.json();
        this.showToast(error.detail || "Registration failed", "error");
      }
    } catch (error) {
      this.showToast("Connection error. Please try again.", "error");
    }

    this.showLoading(false);
  }

  async handleLogout() {
    this.authToken = null;
    this.isLoggedIn = false;

    await chrome.storage.local.set({
      authToken: null,
      syncEnabled: false,
    });

    chrome.runtime.sendMessage({
      action: "setAuthToken",
      token: null,
    });

    this.showToast("Logged out successfully", "success");
    this.showSection("login");
    this.updateStatusIndicator();
  }

  async analyzePersona() {
    if (!this.isLoggedIn) {
      this.showToast("Please sign in to analyze your persona", "error");
      return;
    }

    this.showLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/persona/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          include_sensitive: false,
          days_back: 30,
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        this.displayPersonaAnalysis(analysis);
        this.showToast("Persona analysis complete!", "success");
      } else {
        this.showToast("Analysis failed. Please try again.", "error");
      }
    } catch (error) {
      this.showToast("Connection error during analysis", "error");
    }

    this.showLoading(false);
  }

  displayPersonaAnalysis(analysis) {
    // Update persona summary
    document.getElementById("personaSummary").textContent =
      analysis.persona_summary;

    // Update stats
    document.getElementById("dataPointsCount").textContent =
      analysis.data_points_analyzed;
    document.getElementById("topicsCount").textContent =
      analysis.top_topics.length;
    document.getElementById("traitsCount").textContent =
      analysis.personality_traits.length;

    // Update traits
    const traitsContainer = document.getElementById("personaTraits");
    traitsContainer.innerHTML = "";
    analysis.personality_traits.forEach((trait) => {
      const traitTag = document.createElement("span");
      traitTag.className = "trait-tag";
      traitTag.textContent = trait.replace("-", " ");
      traitsContainer.appendChild(traitTag);
    });

    // Update topics
    const topicsContainer = document.getElementById("topicsList");
    topicsContainer.innerHTML = "";
    analysis.top_topics.slice(0, 8).forEach((topic) => {
      const topicTag = document.createElement("span");
      topicTag.className = "topic-tag";
      topicTag.textContent = topic;
      topicsContainer.appendChild(topicTag);
    });
  }

  async loadDashboardData() {
    // Load local behavior data count
    const localData = await chrome.runtime.sendMessage({
      action: "getBehaviorData",
    });
    const localCount = localData?.behaviorData?.length || 0;

    if (!this.isLoggedIn) {
      // Show local-only data
      document.getElementById("dataPointsCount").textContent = localCount;
      document.getElementById("personaSummary").textContent =
        localCount > 0
          ? `You have ${localCount} local data points. Sign in to get AI-powered insights!`
          : "Start browsing to build your digital persona...";
      return;
    }

    // Load persona data from server
    try {
      const response = await fetch(`${API_BASE_URL}/persona/insights`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const insights = await response.json();
        if (insights.has_data) {
          this.displayPersonaInsights(insights);
        }
      }
    } catch (error) {
      console.log("Failed to load persona insights:", error);
    }
  }

  displayPersonaInsights(insights) {
    document.getElementById("personaSummary").textContent =
      insights.persona_summary;
    document.getElementById("dataPointsCount").textContent =
      insights.data_points_count;
    document.getElementById("topicsCount").textContent =
      insights.top_topics.length;
    document.getElementById("traitsCount").textContent =
      insights.personality_traits.length;

    // Update traits
    const traitsContainer = document.getElementById("personaTraits");
    traitsContainer.innerHTML = "";
    insights.personality_traits.forEach((trait) => {
      const traitTag = document.createElement("span");
      traitTag.className = "trait-tag";
      traitTag.textContent = trait.replace("-", " ");
      traitsContainer.appendChild(traitTag);
    });

    // Update topics
    const topicsContainer = document.getElementById("topicsList");
    topicsContainer.innerHTML = "";
    insights.top_topics.forEach((topic) => {
      const topicTag = document.createElement("span");
      topicTag.className = "topic-tag";
      topicTag.textContent = topic;
      topicsContainer.appendChild(topicTag);
    });
  }

  async exportData() {
    if (this.isLoggedIn) {
      // Export from server
      try {
        const response = await fetch(`${API_BASE_URL}/persona/export`, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.downloadJSON(data, "mirrorme-persona-export.json");
          this.showToast("Data exported successfully!", "success");
        }
      } catch (error) {
        this.showToast("Export failed", "error");
      }
    } else {
      // Export local data
      const localData = await chrome.runtime.sendMessage({
        action: "getBehaviorData",
      });
      const exportData = {
        export_timestamp: new Date().toISOString(),
        local_behavior_data: localData.behaviorData || [],
        note: "Local data export - sign in for full persona analysis",
      };

      this.downloadJSON(exportData, "mirrorme-local-export.json");
      this.showToast("Local data exported!", "success");
    }
  }

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async toggleTracking(enabled) {
    await chrome.storage.local.set({ isEnabled: enabled });
    chrome.runtime.sendMessage({
      action: "toggleTracking",
      enabled: enabled,
    });

    this.showToast(
      enabled ? "Tracking enabled" : "Tracking disabled",
      "success"
    );
  }

  async toggleSync(enabled) {
    if (enabled && !this.isLoggedIn) {
      this.showToast("Please sign in to enable sync", "error");
      document.getElementById("syncToggle").checked = false;
      return;
    }

    await chrome.storage.local.set({ syncEnabled: enabled });
    this.showToast(enabled ? "Sync enabled" : "Sync disabled", "success");
  }

  async clearLocalData() {
    if (
      confirm(
        "Are you sure you want to clear all local data? This cannot be undone."
      )
    ) {
      await chrome.runtime.sendMessage({ action: "clearData" });
      this.showToast("Local data cleared", "success");
      this.loadDashboardData();
    }
  }

  updateStatusIndicator() {
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");

    if (this.isLoggedIn && this.syncEnabled) {
      statusDot.className = "status-dot synced";
      statusText.textContent = "Synced";
    } else if (this.isLoggedIn) {
      statusDot.className = "status-dot";
      statusText.textContent = "Signed In";
    } else {
      statusDot.className = "status-dot offline";
      statusText.textContent = "Local Only";
    }
  }

  updateUI() {
    // Update navigation visibility
    const nav = document.querySelector(".nav");
    if (this.currentSection === "login" || this.currentSection === "register") {
      nav.style.display = "none";
    } else {
      nav.style.display = "flex";
    }

    // Update settings toggles
    document.getElementById("trackingToggle").checked = this.trackingEnabled;
    document.getElementById("syncToggle").checked =
      this.syncEnabled && this.isLoggedIn;

    // Update status indicator
    this.updateStatusIndicator();

    // Show/hide account-specific buttons
    const deleteAccountBtn = document.getElementById("deleteAccountBtn");
    if (this.isLoggedIn) {
      deleteAccountBtn.classList.remove("hidden");
    } else {
      deleteAccountBtn.classList.add("hidden");
    }
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (show) {
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
    }
  }

  showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    const messageEl = toast.querySelector(".toast-message");

    messageEl.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove("hidden");

    setTimeout(() => {
      toast.classList.add("hidden");
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MirrorMePopup();
});
