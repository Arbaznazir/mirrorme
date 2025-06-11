import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  PersonaProfile,
  DigitalAvatar,
  personaAPI,
  behaviorAPI,
  getPerceptionAnalysis,
  getPerceptionComparison,
} from "../services/api";
import "./common.css";
import "./Dashboard.css";

interface EnhancedAnalytics {
  political_tilt: Record<string, number>;
  platform_behavior: Record<string, any>;
  sentiment_distribution: Record<string, number>;
  engagement_patterns: Record<string, number>;
  data_points: number;
  analysis_period_days: number;
}

interface DigitalAvatarsData {
  digital_avatars: DigitalAvatar[];
  data_points: number;
  analysis_period_days: number;
  total_avatars: number;
  message?: string;
}

interface AlgorithmInfluenceData {
  timeline_data: Array<{
    date: string;
    political_left: number;
    political_right: number;
    political_neutral: number;
    sentiment_positive: number;
    sentiment_negative: number;
    sentiment_neutral: number;
    total_interactions: number;
    platform_distribution: Record<string, number>;
    topic_distribution: Record<string, number>;
  }>;
  political_trend: number[];
  sentiment_trend: number[];
  algorithm_influence: {
    bias_reinforcement_detected: boolean;
    political_polarization_trend: string;
    sentiment_manipulation_detected: boolean;
    topic_echo_chambers: Array<{
      topic: string;
      concentration: number;
      warning: string;
    }>;
    platform_bias_warnings: Array<{
      platform: string;
      bias_direction: string;
      strength: number;
      warning: string;
    }>;
    recommendations: string[];
  };
  analysis_period_days: number;
  total_data_points: number;
  message?: string;
}

interface TopicBiasData {
  topic_exposure: Record<
    string,
    {
      total_count: number;
      platform_breakdown: Record<string, number>;
      sentiment_breakdown: Record<string, number>;
      political_breakdown: Record<string, number>;
    }
  >;
  algorithmic_push_detected: Array<{
    topic: string;
    exposure_percentage: number;
    sentiment_bias: any;
    political_bias: any;
    platform_breakdown: Record<string, number>;
    warning: string;
  }>;
  coordinated_topics: Array<{
    topic: string;
    platforms: string[];
    total_exposure: number;
    coordination_strength: number;
    warning: string;
  }>;
  platform_topic_bias: Record<string, Record<string, number>>;
  total_interactions_analyzed: number;
  analysis_period_days: number;
  message?: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [personaData, setPersonaData] = useState<PersonaProfile | null>(null);
  const [enhancedAnalytics, setEnhancedAnalytics] =
    useState<EnhancedAnalytics | null>(null);
  const [digitalAvatars, setDigitalAvatars] =
    useState<DigitalAvatarsData | null>(null);
  const [algorithmInfluenceData, setAlgorithmInfluenceData] =
    useState<AlgorithmInfluenceData | null>(null);
  const [topicBiasData, setTopicBiasData] = useState<TopicBiasData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [loadingInfluence, setLoadingInfluence] = useState(false);
  const [perceptionData, setPerceptionData] = useState<any>(null);
  const [selectedPerceiver, setSelectedPerceiver] =
    useState<string>("advertiser");
  const [perceptionComparison, setPerceptionComparison] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchPerceptionData = useCallback(async () => {
    try {
      const [analysis, comparison] = await Promise.all([
        getPerceptionAnalysis(selectedPerceiver),
        getPerceptionComparison(),
      ]);

      setPerceptionData(analysis);
      setPerceptionComparison(comparison);
    } catch (error) {
      console.error("Error fetching perception data:", error);
      // No mock data - let the beautiful empty state show
    }
  }, [selectedPerceiver]);

  useEffect(() => {
    loadPersonaData();
    loadEnhancedAnalytics();
    loadDigitalAvatars();
    loadAlgorithmInfluenceData();
    fetchPerceptionData();
  }, [fetchPerceptionData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const loadPersonaData = async () => {
    try {
      const personaData = await personaAPI.getProfile();
      setPersonaData(personaData);
    } catch (err: any) {
      setError("Failed to load persona data");
    } finally {
      setLoading(false);
    }
  };

  const loadEnhancedAnalytics = async () => {
    try {
      const analyticsData = await behaviorAPI.getEnhancedAnalytics(30);
      setEnhancedAnalytics(analyticsData);
    } catch (err: any) {
      console.log("Failed to load enhanced analytics:", err);
    }
  };

  const loadDigitalAvatars = async () => {
    try {
      const avatarsData = await behaviorAPI.getDigitalAvatars(30);
      setDigitalAvatars(avatarsData);
    } catch (err: any) {
      console.log("Failed to load digital avatars:", err);
    }
  };

  const loadAlgorithmInfluenceData = async () => {
    try {
      setLoadingInfluence(true);
      const influenceResponse = await fetch(
        "/api/analysis/algorithm-influence"
      );
      const topicResponse = await fetch("/api/analysis/topic-bias");

      if (influenceResponse.ok && topicResponse.ok) {
        const influenceData = await influenceResponse.json();
        const topicData = await topicResponse.json();
        setAlgorithmInfluenceData(influenceData as AlgorithmInfluenceData);
        setTopicBiasData(topicData as TopicBiasData);
      }
    } catch (error) {
      console.error("Error loading algorithm influence data:", error);
    } finally {
      setLoadingInfluence(false);
    }
  };

  const handleAnalyzePersona = async () => {
    setAnalyzing(true);
    setError("");

    try {
      const newPersona = await personaAPI.analyzePersona();
      setPersonaData(newPersona);
      // Reload enhanced analytics and digital avatars after analysis
      await loadEnhancedAnalytics();
      await loadDigitalAvatars();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to analyze persona");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogSampleBehavior = async () => {
    try {
      await behaviorAPI.logBehavior({
        activity_type: "search",
        metadata: {
          keywords: ["react", "typescript", "web development"],
          category: "technology",
          duration: 120,
        },
      });
      alert("Sample behavior logged successfully!");
    } catch (err: any) {
      alert(
        "Failed to log behavior: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleExportData = async () => {
    try {
      const data = await behaviorAPI.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mirrorme-data-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(
        "Failed to export data: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  const getPoliticalLeanText = (politicalTilt: Record<string, number>) => {
    const left = politicalTilt.left || 0;
    const right = politicalTilt.right || 0;
    const neutral = politicalTilt.neutral || 0;

    if (left > right && left > neutral) {
      return {
        text: "Progressive/Liberal Lean",
        color: "#3b82f6",
        percentage: Math.round(left * 100),
      };
    } else if (right > left && right > neutral) {
      return {
        text: "Conservative Lean",
        color: "#ef4444",
        percentage: Math.round(right * 100),
      };
    } else {
      return {
        text: "Politically Neutral",
        color: "#6b7280",
        percentage: Math.round(neutral * 100),
      };
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😔";
      default:
        return "😐";
    }
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "🐦";
      case "youtube":
        return "📺";
      case "instagram":
        return "📸";
      default:
        return "🌐";
    }
  };

  const getPoliticalColor = (politicalLean: string) => {
    switch (politicalLean) {
      case "left":
        return "#3b82f6";
      case "right":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getEmotionalColor = (emotionalTone: string) => {
    switch (emotionalTone) {
      case "positive":
        return "#10b981";
      case "negative":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength > 0.4) return "#2dd4bf";
    if (strength > 0.2) return "#8b5cf6";
    return "#6b7280";
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "2px solid transparent",
              borderTop: "2px solid #2dd4bf",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#cbd5e1", fontSize: "1.125rem" }}>
            Loading your digital reflection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1rem 0",
        }}
      >
        <div
          style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                className="logo-container"
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  marginRight: "0.75rem",
                }}
              >
                <img src="/logo.png" alt="MirrorMe" className="logo-image" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "white",
                    margin: 0,
                  }}
                >
                  MirrorMe
                </h1>
                <p
                  style={{ fontSize: "0.875rem", color: "#cbd5e1", margin: 0 }}
                >
                  Digital Identity Reflection
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ color: "#cbd5e1" }}>
                Welcome, {user?.full_name || user?.email}
              </span>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem" }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main
        style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={handleAnalyzePersona}
            disabled={analyzing}
            className="glass-card"
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              textAlign: "left",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "1rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>🧠</span>
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: "600",
                    color: "white",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Analyze Persona
                </h3>
                <p
                  style={{ fontSize: "0.875rem", color: "#cbd5e1", margin: 0 }}
                >
                  Generate AI insights
                </p>
              </div>
            </div>
            {analyzing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#3b82f6",
                }}
              >
                <div
                  style={{
                    width: "1rem",
                    height: "1rem",
                    border: "2px solid transparent",
                    borderTop: "2px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "0.5rem",
                  }}
                ></div>
                Analyzing...
              </div>
            )}
          </button>

          <button
            onClick={handleLogSampleBehavior}
            className="glass-card"
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              textAlign: "left",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "1rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>📊</span>
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: "600",
                    color: "white",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Log Sample Data
                </h3>
                <p
                  style={{ fontSize: "0.875rem", color: "#cbd5e1", margin: 0 }}
                >
                  Add test behavior
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleExportData}
            className="glass-card"
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              textAlign: "left",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "1rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>📥</span>
              </div>
              <div>
                <h3
                  style={{
                    fontWeight: "600",
                    color: "white",
                    margin: 0,
                    marginBottom: "0.25rem",
                  }}
                >
                  Export Data
                </h3>
                <p
                  style={{ fontSize: "0.875rem", color: "#cbd5e1", margin: 0 }}
                >
                  Download your data
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          {/* Digital Avatars Card - Top 5 Personalities */}
          {digitalAvatars &&
            digitalAvatars.digital_avatars &&
            digitalAvatars.digital_avatars.length > 0 && (
              <div
                className="glass-card"
                style={{
                  padding: "2rem",
                  borderRadius: "1.5rem",
                  gridColumn: "1 / -1", // Full width for featured content
                }}
              >
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  👥 Your Digital Avatars
                </h2>
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    marginBottom: "2rem",
                  }}
                >
                  The different versions of you across platforms - your digital
                  personalities revealed
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {digitalAvatars.digital_avatars.map((avatar, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "1.5rem",
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
                        borderRadius: "1rem",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Strength indicator */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background: getStrengthColor(avatar.strength),
                          opacity: 0.8,
                        }}
                      ></div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "2rem",
                            marginRight: "0.75rem",
                          }}
                        >
                          {avatar.emoji}
                        </div>
                        <div>
                          <h3
                            style={{
                              color: "white",
                              fontWeight: "600",
                              fontSize: "1.125rem",
                              margin: 0,
                            }}
                          >
                            {avatar.name}
                          </h3>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                              margin: 0,
                            }}
                          >
                            {avatar.platform}
                          </p>
                        </div>
                      </div>

                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: "0.875rem",
                          lineHeight: "1.5",
                          marginBottom: "1rem",
                        }}
                      >
                        {avatar.description}
                      </p>

                      {/* Behavior Pattern */}
                      <div
                        style={{
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <p
                          style={{
                            color: "#e2e8f0",
                            fontSize: "0.75rem",
                            margin: 0,
                          }}
                        >
                          {avatar.behavior_pattern}
                        </p>
                      </div>

                      {/* Personality Traits */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.25rem",
                          }}
                        >
                          {avatar.personality_traits
                            .slice(0, 3)
                            .map((trait, traitIndex) => (
                              <span
                                key={traitIndex}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #2dd4bf, #0d9488)",
                                  color: "white",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.375rem",
                                  fontSize: "0.625rem",
                                  fontWeight: "500",
                                }}
                              >
                                {trait}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Political & Emotional indicators */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: getPoliticalColor(
                                avatar.political_lean
                              ),
                            }}
                          ></div>
                          <span
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {avatar.political_lean}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: getEmotionalColor(
                                avatar.emotional_tone
                              ),
                            }}
                          ></div>
                          <span
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {avatar.emotional_tone}
                          </span>
                        </div>

                        <div
                          style={{
                            color: "#2dd4bf",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {Math.round(avatar.strength * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "rgba(45, 212, 191, 0.1)",
                    borderRadius: "0.75rem",
                    textAlign: "center",
                    border: "1px solid rgba(45, 212, 191, 0.2)",
                  }}
                >
                  <p
                    style={{
                      color: "#2dd4bf",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    💡 <strong>Insight:</strong> Your strongest digital
                    personality is{" "}
                    <strong>{digitalAvatars.digital_avatars[0]?.name}</strong>{" "}
                    representing{" "}
                    {Math.round(
                      (digitalAvatars.digital_avatars[0]?.strength || 0) * 100
                    )}
                    % of your online behavior
                  </p>
                </div>
              </div>
            )}

          {/* No Avatars State */}
          {digitalAvatars && digitalAvatars.digital_avatars.length === 0 && (
            <div
              className="glass-card"
              style={{
                padding: "2rem",
                borderRadius: "1.5rem",
                textAlign: "center",
                gridColumn: "1 / -1",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                👥 Your Digital Avatars
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                {digitalAvatars.message ||
                  "Start browsing with the extension to discover your digital personalities!"}
              </p>
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <p
                  style={{
                    color: "#3b82f6",
                    fontSize: "0.875rem",
                    margin: 0,
                  }}
                >
                  🚀 Install the browser extension and browse Twitter, YouTube,
                  or search Google to generate your digital avatars
                </p>
              </div>
            </div>
          )}

          {/* Political Analysis Card */}
          {enhancedAnalytics && enhancedAnalytics.data_points > 0 && (
            <div
              className="glass-card"
              style={{ padding: "2rem", borderRadius: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                🗳️ Political Analysis
              </h2>

              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  {(() => {
                    const political = getPoliticalLeanText(
                      enhancedAnalytics.political_tilt
                    );
                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{ color: "#cbd5e1", fontSize: "0.875rem" }}
                          >
                            {political.text}
                          </span>
                          <span
                            style={{
                              color: political.color,
                              fontWeight: "600",
                            }}
                          >
                            {political.percentage}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "0.5rem",
                            background: "rgba(255, 255, 255, 0.1)",
                            borderRadius: "0.25rem",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${political.percentage}%`,
                              height: "100%",
                              background: political.color,
                              borderRadius: "0.25rem",
                            }}
                          ></div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div
                  style={{ display: "flex", gap: "1rem", fontSize: "0.75rem" }}
                >
                  <div style={{ color: "#3b82f6" }}>
                    Left:{" "}
                    {Math.round(
                      (enhancedAnalytics.political_tilt.left || 0) * 100
                    )}
                    %
                  </div>
                  <div style={{ color: "#ef4444" }}>
                    Right:{" "}
                    {Math.round(
                      (enhancedAnalytics.political_tilt.right || 0) * 100
                    )}
                    %
                  </div>
                  <div style={{ color: "#6b7280" }}>
                    Neutral:{" "}
                    {Math.round(
                      (enhancedAnalytics.political_tilt.neutral || 0) * 100
                    )}
                    %
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#cbd5e1",
                }}
              >
                Political sentiment detected from your browsing patterns and
                content engagement
              </div>
            </div>
          )}

          {/* Platform Behavior Card */}
          {enhancedAnalytics &&
            enhancedAnalytics.platform_behavior &&
            Object.keys(enhancedAnalytics.platform_behavior).length > 0 && (
              <div
                className="glass-card"
                style={{ padding: "2rem", borderRadius: "1.5rem" }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "white",
                    marginBottom: "1.5rem",
                  }}
                >
                  📱 Platform Behavior
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {Object.entries(enhancedAnalytics.platform_behavior).map(
                    ([platform, data]: [string, any]) => (
                      <div
                        key={platform}
                        style={{
                          padding: "1rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span style={{ fontSize: "1.25rem" }}>
                              {getPlatformEmoji(platform)}
                            </span>
                            <span
                              style={{
                                color: "white",
                                fontWeight: "600",
                                textTransform: "capitalize",
                              }}
                            >
                              {platform}
                            </span>
                          </div>
                          <span
                            style={{ color: "#2dd4bf", fontSize: "0.875rem" }}
                          >
                            {data.total_interactions} interactions
                          </span>
                        </div>

                        {data.sentiment_distribution && (
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              fontSize: "0.75rem",
                              marginBottom: "0.5rem",
                            }}
                          >
                            {Object.entries(data.sentiment_distribution).map(
                              ([sentiment, value]: [string, any]) => (
                                <div
                                  key={sentiment}
                                  style={{ color: "#cbd5e1" }}
                                >
                                  {getSentimentEmoji(sentiment)}{" "}
                                  {Math.round(value * 100)}%
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {data.top_channels && data.top_channels.length > 0 && (
                          <div
                            style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                          >
                            Top: {data.top_channels[0][0]}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Emotional Analysis Card */}
          {enhancedAnalytics && enhancedAnalytics.sentiment_distribution && (
            <div
              className="glass-card"
              style={{ padding: "2rem", borderRadius: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                😊 Emotional Analysis
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {Object.entries(enhancedAnalytics.sentiment_distribution).map(
                  ([sentiment, value]: [string, any]) => (
                    <div
                      key={sentiment}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.25rem" }}>
                          {getSentimentEmoji(sentiment)}
                        </span>
                        <span
                          style={{
                            color: "#cbd5e1",
                            fontSize: "0.875rem",
                            textTransform: "capitalize",
                          }}
                        >
                          {sentiment}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: "4rem",
                            height: "0.25rem",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "0.125rem",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.round(value * 100)}%`,
                              height: "100%",
                              background:
                                sentiment === "positive"
                                  ? "#10b981"
                                  : sentiment === "negative"
                                  ? "#ef4444"
                                  : "#6b7280",
                              borderRadius: "0.125rem",
                            }}
                          ></div>
                        </div>
                        <span
                          style={{
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                          }}
                        >
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  color: "#cbd5e1",
                }}
              >
                Emotional tone analysis based on your content interactions
              </div>
            </div>
          )}

          {/* Engagement Patterns Card */}
          {enhancedAnalytics && enhancedAnalytics.engagement_patterns && (
            <div
              className="glass-card"
              style={{ padding: "2rem", borderRadius: "1.5rem" }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "1.5rem",
                }}
              >
                🎯 Engagement Patterns
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>🔍</span>
                    <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                      Searches
                    </span>
                  </div>
                  <span style={{ color: "#3b82f6", fontWeight: "600" }}>
                    {enhancedAnalytics.engagement_patterns.searches || 0}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>🐦</span>
                    <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                      Social Interactions
                    </span>
                  </div>
                  <span style={{ color: "#10b981", fontWeight: "600" }}>
                    {enhancedAnalytics.engagement_patterns
                      .social_interactions || 0}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>📺</span>
                    <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                      Video Consumption
                    </span>
                  </div>
                  <span style={{ color: "#8b5cf6", fontWeight: "600" }}>
                    {enhancedAnalytics.engagement_patterns.video_consumption ||
                      0}
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.75rem",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    color: "#2dd4bf",
                    fontWeight: "600",
                    fontSize: "1.125rem",
                  }}
                >
                  {enhancedAnalytics.data_points}
                </span>
                <span
                  style={{
                    color: "#cbd5e1",
                    fontSize: "0.875rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  data points analyzed over{" "}
                  {enhancedAnalytics.analysis_period_days} days
                </span>
              </div>
            </div>
          )}
          {/* AI Summary Card */}
          <div
            className="glass-card"
            style={{ padding: "2rem", borderRadius: "1.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              Your Digital Persona
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "0.5rem",
                }}
              >
                AI Summary
              </h3>
              <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                {personaData?.persona_summary || "No summary available yet."}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "0.75rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "1.25rem" }}>📊</span>
                <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                  Data Points Analyzed
                </span>
              </div>
              <span style={{ color: "white", fontWeight: "600" }}>
                {personaData?.data_points_count || 0}
              </span>
            </div>
          </div>

          {/* Topics & Interests */}
          <div
            className="glass-card"
            style={{ padding: "2rem", borderRadius: "1.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              Topics & Interests
            </h2>

            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "white",
                  marginBottom: "1rem",
                }}
              >
                Main Topics
              </h3>
              {personaData?.top_topics && personaData.top_topics.length > 0 ? (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {personaData.top_topics
                    .slice(0, 6)
                    .map((topic: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          background:
                            "linear-gradient(135deg, #2dd4bf, #0d9488)",
                          color: "white",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                  No topics yet
                </p>
              )}
            </div>
          </div>

          {/* Personality Traits */}
          <div
            className="glass-card"
            style={{ padding: "2rem", borderRadius: "1.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              Personality Traits
            </h2>

            {personaData?.personality_traits &&
            personaData.personality_traits.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {personaData.personality_traits
                  .slice(0, 5)
                  .map((trait, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>
                        {trait}
                      </span>
                      <div
                        style={{
                          width: "6rem",
                          height: "0.25rem",
                          background: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "0.125rem",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.random() * 100}%`,
                            height: "100%",
                            background:
                              "linear-gradient(135deg, #2dd4bf, #0d9488)",
                            borderRadius: "0.125rem",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                No personality traits analyzed yet
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div
            className="glass-card"
            style={{ padding: "2rem", borderRadius: "1.5rem" }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              Recent Activity
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "0.875rem" }}>🔍</span>
                </div>
                <div>
                  <p
                    style={{ color: "white", fontSize: "0.875rem", margin: 0 }}
                  >
                    Search Activity
                  </p>
                  <p
                    style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}
                  >
                    2 hours ago
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "0.875rem" }}>📖</span>
                </div>
                <div>
                  <p
                    style={{ color: "white", fontSize: "0.875rem", margin: 0 }}
                  >
                    Reading Session
                  </p>
                  <p
                    style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}
                  >
                    5 hours ago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithm Influence Map Section */}
          <div
            style={{
              marginTop: "3rem",
              background: "linear-gradient(135deg, #1e293b, #0f172a)",
              borderRadius: "1.5rem",
              padding: "2rem",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              gridColumn: "1 / -1",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h2
                  style={{
                    color: "white",
                    fontSize: "1.875rem",
                    fontWeight: "700",
                    margin: 0,
                    marginBottom: "0.5rem",
                  }}
                >
                  📊 Algorithm Influence Map
                </h2>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "1rem",
                    margin: 0,
                  }}
                >
                  How algorithms are shaping your digital behavior and biases
                  over time
                </p>
              </div>
              <button
                onClick={loadAlgorithmInfluenceData}
                disabled={loadingInfluence}
                className="glass-card"
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "none",
                  background: loadingInfluence
                    ? "rgba(255, 255, 255, 0.05)"
                    : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  color: "white",
                  cursor: loadingInfluence ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                }}
              >
                {loadingInfluence ? "Analyzing..." : "Refresh Analysis"}
              </button>
            </div>

            {loadingInfluence ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4rem",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    border: "3px solid transparent",
                    borderTop: "3px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "1rem",
                  }}
                ></div>
                Analyzing algorithmic influence patterns...
              </div>
            ) : algorithmInfluenceData && topicBiasData ? (
              <>
                {/* Timeline Visualization */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  {/* Political Bias Timeline */}
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        margin: 0,
                        marginBottom: "1rem",
                      }}
                    >
                      🗳️ Political Bias Timeline
                    </h3>
                    <div
                      style={{
                        height: "200px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {algorithmInfluenceData.timeline_data.length > 0 ? (
                        <div>
                          {/* Simple timeline chart representation */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "end",
                              height: "160px",
                              gap: "2px",
                              padding: "1rem 0",
                            }}
                          >
                            {algorithmInfluenceData.timeline_data
                              .slice(-14)
                              .map((point, index) => (
                                <div
                                  key={point.date}
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    height: "100%",
                                  }}
                                >
                                  {/* Left lean bar */}
                                  <div
                                    style={{
                                      width: "8px",
                                      height: `${
                                        (point.political_left / 100) * 60
                                      }px`,
                                      background:
                                        "linear-gradient(180deg, #3b82f6, #1d4ed8)",
                                      borderRadius: "2px",
                                      marginBottom: "2px",
                                    }}
                                    title={`Left: ${point.political_left.toFixed(
                                      1
                                    )}%`}
                                  ></div>
                                  {/* Right lean bar */}
                                  <div
                                    style={{
                                      width: "8px",
                                      height: `${
                                        (point.political_right / 100) * 60
                                      }px`,
                                      background:
                                        "linear-gradient(180deg, #ef4444, #dc2626)",
                                      borderRadius: "2px",
                                      marginBottom: "auto",
                                    }}
                                    title={`Right: ${point.political_right.toFixed(
                                      1
                                    )}%`}
                                  ></div>
                                  {/* Date label */}
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: "0.625rem",
                                      transform: "rotate(-45deg)",
                                      transformOrigin: "center",
                                      marginTop: "0.5rem",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {new Date(point.date).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" }
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ color: "#3b82f6" }}>
                              ■ Left Lean
                            </span>
                            <span style={{ color: "#ef4444" }}>
                              ■ Right Lean
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#64748b",
                          }}
                        >
                          Not enough data for timeline visualization
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sentiment Timeline */}
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        margin: 0,
                        marginBottom: "1rem",
                      }}
                    >
                      😊 Emotional Timeline
                    </h3>
                    <div
                      style={{
                        height: "200px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {algorithmInfluenceData.timeline_data.length > 0 ? (
                        <div>
                          {/* Simple sentiment timeline */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "end",
                              height: "160px",
                              gap: "2px",
                              padding: "1rem 0",
                            }}
                          >
                            {algorithmInfluenceData.timeline_data
                              .slice(-14)
                              .map((point, index) => (
                                <div
                                  key={point.date}
                                  style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    height: "100%",
                                  }}
                                >
                                  {/* Positive sentiment bar */}
                                  <div
                                    style={{
                                      width: "8px",
                                      height: `${
                                        (point.sentiment_positive / 100) * 60
                                      }px`,
                                      background:
                                        "linear-gradient(180deg, #10b981, #059669)",
                                      borderRadius: "2px",
                                      marginBottom: "2px",
                                    }}
                                    title={`Positive: ${point.sentiment_positive.toFixed(
                                      1
                                    )}%`}
                                  ></div>
                                  {/* Negative sentiment bar */}
                                  <div
                                    style={{
                                      width: "8px",
                                      height: `${
                                        (point.sentiment_negative / 100) * 60
                                      }px`,
                                      background:
                                        "linear-gradient(180deg, #f59e0b, #d97706)",
                                      borderRadius: "2px",
                                      marginBottom: "auto",
                                    }}
                                    title={`Negative: ${point.sentiment_negative.toFixed(
                                      1
                                    )}%`}
                                  ></div>
                                  {/* Date label */}
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: "0.625rem",
                                      transform: "rotate(-45deg)",
                                      transformOrigin: "center",
                                      marginTop: "0.5rem",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {new Date(point.date).toLocaleDateString(
                                      "en-US",
                                      { month: "short", day: "numeric" }
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              color: "#64748b",
                              fontSize: "0.75rem",
                              marginTop: "0.5rem",
                            }}
                          >
                            <span style={{ color: "#10b981" }}>■ Positive</span>
                            <span style={{ color: "#f59e0b" }}>■ Negative</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#64748b",
                          }}
                        >
                          Not enough data for timeline visualization
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* No Major Issues State */}
                {!algorithmInfluenceData.algorithm_influence
                  .bias_reinforcement_detected &&
                !algorithmInfluenceData.algorithm_influence
                  .sentiment_manipulation_detected &&
                algorithmInfluenceData.algorithm_influence.topic_echo_chambers
                  .length === 0 &&
                algorithmInfluenceData.algorithm_influence
                  .platform_bias_warnings.length === 0 ? (
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        color: "#6ee7b7",
                        fontWeight: "600",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ✅ No Major Algorithmic Manipulation Detected
                    </div>
                    <div style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>
                      Your content consumption patterns appear relatively
                      balanced and organic. Keep monitoring your digital diet
                      for optimal mental health.
                    </div>
                  </div>
                ) : (
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        color: "#fecaca",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        margin: 0,
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      ⚠️ Algorithmic Influence Detected
                    </h3>

                    {/* Display all detected issues */}
                    {algorithmInfluenceData.algorithm_influence
                      .bias_reinforcement_detected && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          marginBottom: "1rem",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <div
                          style={{
                            color: "#fecaca",
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                          }}
                        >
                          📈 Political Polarization Increasing
                        </div>
                        <div style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>
                          Your content consumption is becoming more politically
                          polarized over time.
                        </div>
                      </div>
                    )}

                    {algorithmInfluenceData.algorithm_influence
                      .sentiment_manipulation_detected && (
                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.1)",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          marginBottom: "1rem",
                          border: "1px solid rgba(245, 158, 11, 0.2)",
                        }}
                      >
                        <div
                          style={{
                            color: "#fcd34d",
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                          }}
                        >
                          🎭 Emotional Manipulation Detected
                        </div>
                        <div style={{ color: "#e2e8f0", fontSize: "0.875rem" }}>
                          Algorithms may be deliberately triggering strong
                          emotional reactions.
                        </div>
                      </div>
                    )}

                    {algorithmInfluenceData.algorithm_influence.topic_echo_chambers.map(
                      (chamber, index) => (
                        <div
                          key={index}
                          style={{
                            background: "rgba(139, 92, 246, 0.1)",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            border: "1px solid rgba(139, 92, 246, 0.2)",
                          }}
                        >
                          <div
                            style={{
                              color: "#c4b5fd",
                              fontWeight: "600",
                              marginBottom: "0.5rem",
                            }}
                          >
                            🔄 Echo Chamber:{" "}
                            {chamber.topic.charAt(0).toUpperCase() +
                              chamber.topic.slice(1)}
                          </div>
                          <div
                            style={{ color: "#e2e8f0", fontSize: "0.875rem" }}
                          >
                            {chamber.warning}
                          </div>
                        </div>
                      )
                    )}

                    {algorithmInfluenceData.algorithm_influence.platform_bias_warnings.map(
                      (warning, index) => (
                        <div
                          key={index}
                          style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            padding: "1rem",
                            borderRadius: "0.5rem",
                            marginBottom: "1rem",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                          }}
                        >
                          <div
                            style={{
                              color: "#93c5fd",
                              fontWeight: "600",
                              marginBottom: "0.5rem",
                            }}
                          >
                            📱 Platform Bias:{" "}
                            {warning.platform.charAt(0).toUpperCase() +
                              warning.platform.slice(1)}
                          </div>
                          <div
                            style={{ color: "#e2e8f0", fontSize: "0.875rem" }}
                          >
                            {warning.warning}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Topics Being Pushed */}
                {topicBiasData.algorithmic_push_detected.length > 0 && (
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(255, 255, 255, 0.05)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        margin: 0,
                        marginBottom: "1rem",
                      }}
                    >
                      🎯 Topics Being Pushed Towards You
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {topicBiasData.algorithmic_push_detected.map(
                        (topic, index) => (
                          <div
                            key={index}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              padding: "1rem",
                              borderRadius: "0.75rem",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <div
                              style={{
                                color: "white",
                                fontWeight: "600",
                                marginBottom: "0.5rem",
                                fontSize: "1rem",
                              }}
                            >
                              {topic.topic.charAt(0).toUpperCase() +
                                topic.topic.slice(1)}
                            </div>
                            <div
                              style={{
                                color: "#f59e0b",
                                fontSize: "0.875rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              {topic.exposure_percentage.toFixed(1)}% of your
                              content
                            </div>
                            <div
                              style={{
                                color: "#cbd5e1",
                                fontSize: "0.75rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              {topic.warning}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {algorithmInfluenceData.algorithm_influence.recommendations
                  .length > 0 && (
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <h3
                      style={{
                        color: "#93c5fd",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        margin: 0,
                        marginBottom: "1rem",
                      }}
                    >
                      💡 Recommendations to Reduce Algorithmic Influence
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
                      {algorithmInfluenceData.algorithm_influence.recommendations.map(
                        (rec, index) => (
                          <li
                            key={index}
                            style={{
                              color: "#e2e8f0",
                              fontSize: "0.875rem",
                              marginBottom: "0.5rem",
                              lineHeight: "1.5",
                            }}
                          >
                            {rec}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    📊
                  </div>
                  <div style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                    No Algorithm Influence Data Available
                  </div>
                  <div style={{ fontSize: "0.875rem" }}>
                    Start browsing with the extension to generate your algorithm
                    influence analysis
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Perception Simulator Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  padding: "0.75rem",
                  background: "rgba(147, 51, 234, 0.2)",
                  borderRadius: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>👁️</span>
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "white",
                    margin: 0,
                  }}
                >
                  Perception Simulator
                </h2>
                <p
                  style={{
                    color: "#d1d5db",
                    fontSize: "0.875rem",
                    margin: 0,
                  }}
                >
                  How different people see your online presence
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 1rem",
                  color: "white",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minWidth: "200px",
                  transition: "all 0.2s ease",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <span>
                  {selectedPerceiver === "advertiser" && "📊 Advertiser"}
                  {selectedPerceiver === "content_feeder" &&
                    "🎯 Content Algorithm"}
                  {selectedPerceiver === "data_broker" && "💾 Data Broker"}
                  {selectedPerceiver === "ai_system" && "🤖 AI System"}
                </span>
                <span
                  style={{
                    transform: isDropdownOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    fontSize: "0.75rem",
                  }}
                >
                  ▼
                </span>
              </div>

              {isDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "0.25rem",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.5rem",
                    backdropFilter: "blur(20px)",
                    zIndex: 50,
                    overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {[
                    { value: "advertiser", label: "📊 Advertiser" },
                    { value: "content_feeder", label: "🎯 Content Algorithm" },
                    { value: "data_broker", label: "💾 Data Broker" },
                    { value: "ai_system", label: "🤖 AI System" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      onClick={() => {
                        setSelectedPerceiver(option.value);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        color: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        backgroundColor:
                          selectedPerceiver === option.value
                            ? "rgba(147, 51, 234, 0.3)"
                            : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPerceiver !== option.value) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPerceiver !== option.value) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {perceptionData ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* Overall Impression & Score */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "white",
                      marginBottom: "1.5rem",
                      textAlign: "center",
                    }}
                  >
                    Overall Impression
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "4rem",
                        color:
                          perceptionData.overall_impression ===
                            "very_positive" ||
                          perceptionData.overall_impression ===
                            "very_attractive"
                            ? "#4ade80"
                            : perceptionData.overall_impression ===
                                "positive" ||
                              perceptionData.overall_impression === "attractive"
                            ? "#60a5fa"
                            : perceptionData.overall_impression === "neutral"
                            ? "#facc15"
                            : perceptionData.overall_impression ===
                              "insufficient_data"
                            ? "#9ca3af"
                            : "#f87171",
                      }}
                    >
                      {perceptionData.overall_impression === "very_positive" ||
                      perceptionData.overall_impression === "very_attractive"
                        ? "😍"
                        : perceptionData.overall_impression === "positive" ||
                          perceptionData.overall_impression === "attractive"
                        ? "😊"
                        : perceptionData.overall_impression === "neutral"
                        ? "😐"
                        : perceptionData.overall_impression ===
                          "insufficient_data"
                        ? "🔍"
                        : "😟"}
                    </div>
                    <p
                      style={{
                        color: "white",
                        fontWeight: "500",
                        fontSize: "1.125rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {perceptionData.overall_impression === "insufficient_data"
                        ? "Insufficient Data"
                        : perceptionData.overall_impression.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "white",
                      marginBottom: "1.5rem",
                      textAlign: "center",
                    }}
                  >
                    {selectedPerceiver === "advertiser"
                      ? "Targeting Value"
                      : selectedPerceiver === "content_feeder"
                      ? "Engagement Score"
                      : selectedPerceiver === "data_broker"
                      ? "Data Value"
                      : "AI Confidence"}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {(() => {
                      const score =
                        perceptionData.hire_likelihood ||
                        perceptionData.compatibility_score ||
                        perceptionData.collaboration_score ||
                        perceptionData.family_harmony_score ||
                        perceptionData.targeting_value ||
                        perceptionData.engagement_score ||
                        perceptionData.data_value ||
                        perceptionData.ai_confidence ||
                        0;

                      return (
                        <>
                          <div
                            style={{
                              fontSize: "3rem",
                              fontWeight: "bold",
                              color: "white",
                            }}
                          >
                            {score}%
                          </div>
                          <div
                            style={{
                              width: "100%",
                              maxWidth: "20rem",
                              background: "rgba(55, 65, 81, 0.5)",
                              borderRadius: "9999px",
                              height: "1rem",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "1rem",
                                borderRadius: "9999px",
                                transition: "all 0.5s ease",
                                background:
                                  score >= 70
                                    ? "linear-gradient(90deg, #10b981, #4ade80)"
                                    : score >= 50
                                    ? "linear-gradient(90deg, #eab308, #facc15)"
                                    : "linear-gradient(90deg, #ef4444, #f87171)",
                                width: `${Math.max(score, 0)}%`,
                              }}
                            ></div>
                          </div>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#9ca3af",
                            }}
                          >
                            {score >= 70
                              ? "High"
                              : score >= 50
                              ? "Medium"
                              : "Low"}{" "}
                            confidence level
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Strengths and Concerns */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "2rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        background: "rgba(34, 197, 94, 0.2)",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "#4ade80", fontSize: "1.125rem" }}>
                        ✅
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#4ade80",
                      }}
                    >
                      {selectedPerceiver === "advertiser"
                        ? "Valuable Signals"
                        : selectedPerceiver === "content_feeder"
                        ? "Engagement Drivers"
                        : selectedPerceiver === "data_broker"
                        ? "Profitable Traits"
                        : "AI Advantages"}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {(
                      perceptionData.strengths ||
                      perceptionData.attractive_qualities ||
                      perceptionData.team_fit_qualities ||
                      perceptionData.positive_traits ||
                      perceptionData.valuable_signals ||
                      perceptionData.engagement_drivers ||
                      perceptionData.profitable_traits ||
                      perceptionData.ai_advantages ||
                      []
                    ).length > 0 ? (
                      (
                        perceptionData.strengths ||
                        perceptionData.attractive_qualities ||
                        perceptionData.team_fit_qualities ||
                        perceptionData.positive_traits ||
                        perceptionData.valuable_signals ||
                        perceptionData.engagement_drivers ||
                        perceptionData.profitable_traits ||
                        perceptionData.ai_advantages ||
                        []
                      ).map((strength: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            background: "rgba(34, 197, 94, 0.05)",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(34, 197, 94, 0.2)",
                          }}
                        >
                          <div
                            style={{
                              width: "0.5rem",
                              height: "0.5rem",
                              background: "#4ade80",
                              borderRadius: "50%",
                              marginTop: "0.5rem",
                              flexShrink: 0,
                            }}
                          ></div>
                          <p
                            style={{
                              color: "#e5e7eb",
                              fontSize: "0.875rem",
                              lineHeight: "1.6",
                            }}
                          >
                            {strength}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: "center" as const,
                          padding: "4rem 1.5rem",
                          background:
                            "linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.05))",
                          borderRadius: "0.75rem",
                          border: "1px solid rgba(147, 51, 234, 0.1)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              width: "4rem",
                              height: "4rem",
                              background:
                                "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
                              borderRadius: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(147, 51, 234, 0.2)",
                            }}
                          >
                            <span style={{ fontSize: "1.875rem" }}>🔍</span>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <h4
                              style={{
                                fontSize: "1.125rem",
                                fontWeight: "600",
                                color: "#a855f7",
                                marginBottom: "0.5rem",
                              }}
                            >
                              Building Your Profile
                            </h4>
                            <p
                              style={{
                                color: "#d1d5db",
                                fontSize: "0.875rem",
                                maxWidth: "18rem",
                                lineHeight: "1.5",
                                marginBottom: "1rem",
                              }}
                            >
                              We need more data to show what makes you valuable
                              to{" "}
                              {selectedPerceiver === "advertiser"
                                ? "advertisers"
                                : selectedPerceiver === "content_feeder"
                                ? "content algorithms"
                                : selectedPerceiver === "data_broker"
                                ? "data brokers"
                                : "AI systems"}
                              .
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              <button
                                style={{
                                  padding: "0.5rem 1rem",
                                  background:
                                    "linear-gradient(90deg, #a855f7, #3b82f6)",
                                  color: "white",
                                  borderRadius: "0.375rem",
                                  fontWeight: "500",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "0.875rem",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                📱 Install Extension
                              </button>
                              <button
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: "rgba(255, 255, 255, 0.1)",
                                  color: "white",
                                  borderRadius: "0.375rem",
                                  fontWeight: "500",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  cursor: "pointer",
                                  fontSize: "0.875rem",
                                  transition: "all 0.2s ease",
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                📘 Learn More
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "2rem",
                        height: "2rem",
                        background: "rgba(234, 179, 8, 0.2)",
                        borderRadius: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "#facc15", fontSize: "1.125rem" }}>
                        ⚠️
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#facc15",
                      }}
                    >
                      {selectedPerceiver === "advertiser"
                        ? "Ad Resistance"
                        : selectedPerceiver === "content_feeder"
                        ? "Algorithm Challenges"
                        : selectedPerceiver === "data_broker"
                        ? "Data Gaps"
                        : "AI Limitations"}
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {(
                      perceptionData.concerns ||
                      perceptionData.potential_concerns ||
                      perceptionData.potential_friction ||
                      perceptionData.family_concerns ||
                      perceptionData.ad_resistance ||
                      perceptionData.algorithm_challenges ||
                      perceptionData.data_gaps ||
                      perceptionData.ai_limitations ||
                      []
                    ).length > 0 ? (
                      (
                        perceptionData.concerns ||
                        perceptionData.potential_concerns ||
                        perceptionData.potential_friction ||
                        perceptionData.family_concerns ||
                        perceptionData.ad_resistance ||
                        perceptionData.algorithm_challenges ||
                        perceptionData.data_gaps ||
                        perceptionData.ai_limitations ||
                        []
                      ).map((concern: string, index: number) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            background: "rgba(234, 179, 8, 0.05)",
                            borderRadius: "0.5rem",
                            border: "1px solid rgba(234, 179, 8, 0.2)",
                          }}
                        >
                          <div
                            style={{
                              width: "0.5rem",
                              height: "0.5rem",
                              background: "#facc15",
                              borderRadius: "50%",
                              marginTop: "0.5rem",
                              flexShrink: 0,
                            }}
                          ></div>
                          <p
                            style={{
                              color: "#e5e7eb",
                              fontSize: "0.875rem",
                              lineHeight: "1.6",
                            }}
                          >
                            {concern}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          textAlign: "center" as const,
                          padding: "4rem 1.5rem",
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))",
                          borderRadius: "0.75rem",
                          border: "1px solid rgba(16, 185, 129, 0.1)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "1rem",
                          }}
                        >
                          <div
                            style={{
                              width: "4rem",
                              height: "4rem",
                              background:
                                "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.2))",
                              borderRadius: "0.75rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(16, 185, 129, 0.2)",
                            }}
                          >
                            <span style={{ fontSize: "1.875rem" }}>✨</span>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <h4
                              style={{
                                fontSize: "1.125rem",
                                fontWeight: "600",
                                color: "#10b981",
                                marginBottom: "0.5rem",
                              }}
                            >
                              Looking Great!
                            </h4>
                            <p
                              style={{
                                color: "#d1d5db",
                                fontSize: "0.875rem",
                                maxWidth: "18rem",
                                lineHeight: "1.5",
                              }}
                            >
                              No significant concerns detected. Keep engaging
                              with diverse content to build an even richer
                              profile.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Red Flags (if any) */}
              {perceptionData.red_flags &&
                perceptionData.red_flags.length > 0 && (
                  <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-400 text-lg">🚩</span>
                      </div>
                      <h3 className="text-xl font-semibold text-red-400">
                        Red Flags
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {perceptionData.red_flags.map(
                        (flag: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg border border-red-500/20"
                          >
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-red-300 text-sm leading-relaxed">
                              {flag}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* AI Feedback */}
              {perceptionData.ai_feedback && (
                <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 text-lg">🤖</span>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-400">
                      AI Analysis
                    </h3>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                    <p className="text-gray-200 leading-relaxed">
                      {perceptionData.ai_feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {perceptionData.recommendations &&
                perceptionData.recommendations.length > 0 && (
                  <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-lg">💡</span>
                      </div>
                      <h3 className="text-xl font-semibold text-purple-400">
                        Improvement Recommendations
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {perceptionData.recommendations.map(
                        (rec: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20"
                          >
                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-gray-200 text-sm leading-relaxed">
                              {rec}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Comparison Summary */}
              {perceptionComparison && perceptionComparison.summary && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-8 text-center">
                    Cross-Perspective Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                        Average Score
                      </p>
                      <p className="text-4xl font-bold text-white mb-2">
                        {perceptionComparison.summary.average_perception_score}%
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                        Strongest With
                      </p>
                      <p className="text-white font-medium capitalize">
                        {perceptionComparison.summary.strongest_perception.replace(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                        Most Concerning To
                      </p>
                      <p className="text-white font-medium capitalize">
                        {perceptionComparison.summary.most_concerning_perception.replace(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center" as const,
                padding: "6rem 2rem",
                background:
                  "linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(99, 102, 241, 0.05) 100%)",
                borderRadius: "1rem",
                border: "1px solid rgba(147, 51, 234, 0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2rem",
                }}
              >
                {/* Icon Container */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "6rem",
                      height: "6rem",
                      background:
                        "linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(99, 102, 241, 0.2) 100%)",
                      borderRadius: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(147, 51, 234, 0.2)",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <span style={{ fontSize: "3rem" }}>👁️</span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "-0.25rem",
                      right: "-0.25rem",
                      width: "1.5rem",
                      height: "1.5rem",
                      background: "linear-gradient(135deg, #facc15, #f97316)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pulse 2s infinite",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <span style={{ fontSize: "0.875rem" }}>✨</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ maxWidth: "32rem", textAlign: "center" }}>
                  <h3
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "white",
                      marginBottom: "1rem",
                    }}
                  >
                    Start Your Perception Analysis
                  </h3>
                  <p
                    style={{
                      color: "#d1d5db",
                      lineHeight: "1.6",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Install the browser extension and start browsing to see how{" "}
                    <span style={{ color: "#a855f7", fontWeight: "500" }}>
                      {selectedPerceiver === "advertiser"
                        ? "advertisers"
                        : selectedPerceiver === "content_feeder"
                        ? "content algorithms"
                        : selectedPerceiver === "data_broker"
                        ? "data brokers"
                        : "AI systems"}
                    </span>{" "}
                    perceive your digital behavior
                  </p>
                </div>

                {/* Features */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                    maxWidth: "28rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        backgroundColor: "#10b981",
                        borderRadius: "50%",
                      }}
                    ></span>
                    <span>Privacy-first</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        backgroundColor: "#3b82f6",
                        borderRadius: "50%",
                      }}
                    ></span>
                    <span>Real-time insights</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        backgroundColor: "#a855f7",
                        borderRadius: "50%",
                      }}
                    ></span>
                    <span>Multi-perspective</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    width: "100%",
                    maxWidth: "20rem",
                  }}
                >
                  <button
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(90deg, #a855f7, #3b82f6)",
                      color: "white",
                      borderRadius: "0.5rem",
                      fontWeight: "500",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 30px rgba(0, 0, 0, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(0, 0, 0, 0.3)";
                    }}
                  >
                    <span>📱</span>
                    Install Extension
                  </button>
                  <button
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                      borderRadius: "0.5rem",
                      fontWeight: "500",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backdropFilter: "blur(10px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                  >
                    <span>📘</span>
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
