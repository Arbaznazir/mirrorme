from typing import List, Dict, Any
from collections import Counter
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from config import settings
from models import BehaviorLog, PersonaProfile
from ai_providers import ai_manager
import re


class PersonaAnalyzer:
    """AI-powered persona analysis engine."""

    def __init__(self):
        self.topic_keywords = {
            "technology": ["tech", "software", "programming", "ai", "computer", "app", "digital", "code"],
            "health": ["health", "fitness", "medical", "wellness", "exercise", "nutrition", "mental"],
            "finance": ["money", "investment", "crypto", "stock", "finance", "budget", "economy"],
            "education": ["learn", "study", "course", "education", "tutorial", "knowledge", "skill"],
            "entertainment": ["movie", "music", "game", "tv", "show", "entertainment", "fun"],
            "news": ["news", "politics", "world", "current", "events", "breaking", "update"],
            "lifestyle": ["fashion", "travel", "food", "home", "lifestyle", "culture", "art"],
            "career": ["job", "career", "work", "professional", "business", "interview", "resume"]
        }

    def extract_topics_from_keywords(self, keywords: List[str]) -> Dict[str, int]:
        """Extract topics from keywords using pattern matching."""
        topic_counts = Counter()

        for keyword in keywords:
            keyword_lower = keyword.lower()
            for topic, topic_keywords in self.topic_keywords.items():
                if any(tk in keyword_lower for tk in topic_keywords):
                    topic_counts[topic] += 1

        return dict(topic_counts)

    def analyze_sentiment_distribution(self, behavior_logs: List[BehaviorLog]) -> Dict[str, float]:
        """Analyze distribution of emotional sentiment in behavior logs."""
        sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
        total_with_sentiment = 0

        for log in behavior_logs:
            if log.sentiment:
                sentiment_counts[log.sentiment] += 1
                total_with_sentiment += 1

        if total_with_sentiment == 0:
            return {"neutral": 1.0}

        # Convert to proportions
        return {sentiment: count / total_with_sentiment
                for sentiment, count in sentiment_counts.items()}

    def analyze_political_tilt_distribution(self, behavior_logs: List[BehaviorLog]) -> Dict[str, float]:
        """Analyze distribution of political tilt in behavior logs."""
        political_counts = {"left": 0, "right": 0, "neutral": 0}
        total_with_politics = 0

        for log in behavior_logs:
            if log.political_tilt:
                political_counts[log.political_tilt] += 1
                total_with_politics += 1

        if total_with_politics == 0:
            return {"neutral": 1.0}

        # Convert to proportions
        return {tilt: count / total_with_politics
                for tilt, count in political_counts.items()}

    def analyze_platform_behavior(self, behavior_logs: List[BehaviorLog]) -> Dict[str, Any]:
        """Analyze behavior patterns across different platforms."""
        platform_stats = {}

        # Twitter/X behavior analysis
        twitter_logs = [log for log in behavior_logs if 'twitter.com' in str(
            log.author) or 'x.com' in str(log.author) or log.behavior_type.startswith('tweet_')]
        if twitter_logs:
            twitter_sentiment = self.analyze_sentiment_distribution(
                twitter_logs)
            twitter_politics = self.analyze_political_tilt_distribution(
                twitter_logs)
            platform_stats['twitter'] = {
                'total_interactions': len(twitter_logs),
                'sentiment_distribution': twitter_sentiment,
                'political_distribution': twitter_politics,
                'engagement_types': {
                    'views': len([log for log in twitter_logs if log.behavior_type == 'tweet_view']),
                    'likes': len([log for log in twitter_logs if log.behavior_type == 'tweet_like']),
                    'retweets': len([log for log in twitter_logs if log.behavior_type == 'tweet_retweet']),
                    'compositions': len([log for log in twitter_logs if log.behavior_type == 'tweet_compose'])
                }
            }

        # YouTube behavior analysis
        youtube_logs = [log for log in behavior_logs if log.behavior_type.startswith(
            'youtube_') or log.video_id]
        if youtube_logs:
            youtube_sentiment = self.analyze_sentiment_distribution(
                youtube_logs)
            youtube_politics = self.analyze_political_tilt_distribution(
                youtube_logs)

            # Analyze top channels
            channel_counts = {}
            for log in youtube_logs:
                if log.channel:
                    channel_counts[log.channel] = channel_counts.get(
                        log.channel, 0) + 1

            platform_stats['youtube'] = {
                'total_interactions': len(youtube_logs),
                'sentiment_distribution': youtube_sentiment,
                'political_distribution': youtube_politics,
                'top_channels': sorted(channel_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                'engagement_types': {
                    'video_watches': len([log for log in youtube_logs if log.behavior_type == 'youtube_video_watch']),
                    'comment_views': len([log for log in youtube_logs if log.behavior_type == 'youtube_comment_view'])
                }
            }

        return platform_stats

    def build_interest_network(self, topic_counts: Dict[str, int]) -> Dict[str, Any]:
        """Build a network graph of interests."""
        if not topic_counts:
            return {}

        total_interactions = sum(topic_counts.values())

        # Calculate interest strengths
        interest_network = {
            "nodes": [
                {
                    "id": topic,
                    "label": topic.title(),
                    "weight": count / total_interactions,
                    "size": min(count / 5, 10)  # Visual size for frontend
                }
                for topic, count in topic_counts.items()
            ],
            "edges": [],  # Could add topic correlations later
            "total_interactions": total_interactions
        }

        return interest_network

    async def generate_persona_summary(self,
                                       topic_counts: Dict[str, int],
                                       sentiment_dist: Dict[str, float],
                                       behavior_patterns: Dict[str, Any]) -> str:
        """Generate natural language persona summary using available AI providers."""

        # Prepare context for AI
        context = {
            "top_topics": list(topic_counts.keys())[:5],
            "sentiment": sentiment_dist,
            "total_interactions": sum(topic_counts.values()),
            "patterns": behavior_patterns
        }

        prompt = f"""Based on the following digital behavior data, create a thoughtful persona summary:

Top interests: {', '.join(context['top_topics'])}
Emotional tone: {context['sentiment']}
Total interactions: {context['total_interactions']}

Write a 2-3 sentence summary that captures this person's digital personality in a respectful, insightful way. Focus on their curiosity patterns and interests, not judgments.

Example: "You appear to be someone with a strong curiosity about technology and health, often exploring topics with a balanced emotional approach. Your digital behavior suggests an analytical mindset with interests spanning both practical and creative domains."
"""

        messages = [
            {"role": "system", "content": "You are a thoughtful digital behavior analyst who creates respectful, insightful personality summaries."},
            {"role": "user", "content": prompt}
        ]

        try:
            result, provider_used = await ai_manager.generate_text(messages, max_tokens=150)
            print(f"Generated summary using {provider_used}")
            return result
        except Exception as e:
            print(f"All AI providers failed: {e}")
            return self._generate_fallback_summary(topic_counts, sentiment_dist)

    def _generate_fallback_summary(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float]) -> str:
        """Generate a basic summary without AI when all providers are unavailable."""
        top_topics = list(topic_counts.keys())[:3]
        dominant_sentiment = max(sentiment_dist.items(), key=lambda x: x[1])[
            0] if sentiment_dist else "balanced"

        if len(top_topics) >= 2:
            return f"Your digital behavior shows strong interests in {top_topics[0]} and {top_topics[1]}, with a generally {dominant_sentiment} approach to online exploration. You demonstrate curiosity across multiple domains."
        elif len(top_topics) == 1:
            return f"You show focused interest in {top_topics[0]}, with a {dominant_sentiment} approach to digital exploration."
        else:
            return "Your digital behavior shows diverse interests and a balanced approach to online exploration."

    def extract_personality_traits(self,
                                   topic_counts: Dict[str, int],
                                   sentiment_dist: Dict[str, float],
                                   political_dist: Dict[str, float],
                                   behavior_logs: List[BehaviorLog]) -> List[str]:
        """Extract personality traits from behavior patterns with enhanced analysis."""
        traits = []

        # Analyze topic diversity
        if len(topic_counts) >= 5:
            traits.append("curious")
        if len(topic_counts) >= 3:
            traits.append("diverse-interests")

        # Analyze sentiment patterns
        if sentiment_dist.get("positive", 0) > 0.6:
            traits.append("optimistic")
        elif sentiment_dist.get("negative", 0) > 0.4:
            traits.append("analytical")

        # Analyze political engagement
        if political_dist.get("left", 0) > 0.4 or political_dist.get("right", 0) > 0.4:
            traits.append("politically-engaged")

        # Analyze specific interests
        if topic_counts.get("technology", 0) > sum(topic_counts.values()) * 0.3:
            traits.append("tech-savvy")
        if topic_counts.get("health", 0) > 0:
            traits.append("health-conscious")
        if topic_counts.get("education", 0) > 0:
            traits.append("learning-oriented")

        # Analyze behavior patterns
        search_logs = [
            log for log in behavior_logs if log.behavior_type == "search"]
        if len(search_logs) > len(behavior_logs) * 0.7:
            traits.append("research-oriented")

        # Analyze social media engagement
        social_logs = [
            log for log in behavior_logs if log.behavior_type.startswith('tweet_')]
        if len(social_logs) > len(behavior_logs) * 0.3:
            traits.append("social-media-active")

        return list(set(traits))  # Remove duplicates

    def generate_digital_avatars(self, behavior_logs: List[BehaviorLog], platform_analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate top 5 digital avatars representing different versions of the user across platforms."""
        avatars = []

        # Avatar 1: Search Persona (based on search behavior)
        search_logs = [
            log for log in behavior_logs if log.behavior_type == "search"]
        if search_logs:
            search_keywords = []
            search_politics = {"left": 0, "right": 0, "neutral": 0}
            search_sentiment = {"positive": 0, "negative": 0, "neutral": 0}

            for log in search_logs:
                search_keywords.extend(log.keywords)
                if log.political_tilt:
                    search_politics[log.political_tilt] += 1
                if log.sentiment:
                    search_sentiment[log.sentiment] += 1

            top_search_topics = self.extract_topics_from_keywords(
                search_keywords)
            dominant_politics = max(search_politics, key=search_politics.get) if any(
                search_politics.values()) else "neutral"
            dominant_sentiment = max(search_sentiment, key=search_sentiment.get) if any(
                search_sentiment.values()) else "neutral"

            search_avatar = {
                "name": "The Searcher",
                "description": f"Your intellectual curious side that actively seeks information",
                "platform": "Google/Search Engines",
                "emoji": "🔍",
                "personality_traits": ["curious", "research-oriented", "analytical"],
                "top_interests": list(top_search_topics.keys())[:3],
                "political_lean": dominant_politics,
                "emotional_tone": dominant_sentiment,
                "behavior_pattern": f"Searches {len(search_logs)} times, focuses on {list(top_search_topics.keys())[0] if top_search_topics else 'various topics'}",
                "strength": len(search_logs) / len(behavior_logs) if behavior_logs else 0
            }
            avatars.append(search_avatar)

        # Avatar 2: Social Media Persona (Twitter/X)
        if 'twitter' in platform_analysis:
            twitter_data = platform_analysis['twitter']
            twitter_logs = [
                log for log in behavior_logs if log.behavior_type.startswith('tweet_')]

            social_personality = []
            if twitter_data['engagement_types']['likes'] > twitter_data['engagement_types']['views'] * 0.1:
                social_personality.append("highly-engaged")
            if twitter_data['engagement_types']['retweets'] > 0:
                social_personality.append("content-amplifier")
            if twitter_data['engagement_types']['compositions'] > 0:
                social_personality.append("content-creator")

            dominant_social_politics = "neutral"
            dominant_social_sentiment = "neutral"
            if twitter_data.get('political_distribution'):
                dominant_social_politics = max(
                    twitter_data['political_distribution'], key=twitter_data['political_distribution'].get)
            if twitter_data.get('sentiment_distribution'):
                dominant_social_sentiment = max(
                    twitter_data['sentiment_distribution'], key=twitter_data['sentiment_distribution'].get)

            social_avatar = {
                "name": "The Social Connector",
                "description": "Your social media persona that engages with trends and people",
                "platform": "Twitter/X",
                "emoji": "🐦",
                "personality_traits": social_personality or ["social-observer"],
                "top_interests": ["social-trends", "current-events", "discussions"],
                "political_lean": dominant_social_politics,
                "emotional_tone": dominant_social_sentiment,
                "behavior_pattern": f"{twitter_data['engagement_types']['likes']} likes, {twitter_data['engagement_types']['retweets']} retweets",
                "strength": len(twitter_logs) / len(behavior_logs) if behavior_logs else 0
            }
            avatars.append(social_avatar)

        # Avatar 3: Entertainment Consumer (YouTube)
        if 'youtube' in platform_analysis:
            youtube_data = platform_analysis['youtube']
            youtube_logs = [
                log for log in behavior_logs if log.behavior_type.startswith('youtube_')]

            entertainment_personality = ["entertainment-focused"]
            if youtube_data.get('top_channels') and len(youtube_data['top_channels']) > 3:
                entertainment_personality.append("diverse-viewer")
            if youtube_data['engagement_types'].get('comment_views', 0) > 0:
                entertainment_personality.append("community-engaged")

            dominant_yt_politics = "neutral"
            dominant_yt_sentiment = "neutral"
            if youtube_data.get('political_distribution'):
                dominant_yt_politics = max(
                    youtube_data['political_distribution'], key=youtube_data['political_distribution'].get)
            if youtube_data.get('sentiment_distribution'):
                dominant_yt_sentiment = max(
                    youtube_data['sentiment_distribution'], key=youtube_data['sentiment_distribution'].get)

            top_channel = youtube_data['top_channels'][0][0] if youtube_data.get(
                'top_channels') else "Various creators"

            entertainment_avatar = {
                "name": "The Content Consumer",
                "description": "Your entertainment-seeking side that watches and learns",
                "platform": "YouTube",
                "emoji": "📺",
                "personality_traits": entertainment_personality,
                "top_interests": ["video-content", "learning", "entertainment"],
                "political_lean": dominant_yt_politics,
                "emotional_tone": dominant_yt_sentiment,
                "behavior_pattern": f"Watches videos, top channel: {top_channel}",
                "strength": len(youtube_logs) / len(behavior_logs) if behavior_logs else 0
            }
            avatars.append(entertainment_avatar)

        # Avatar 4: Professional Self (based on work-related searches and tech content)
        work_logs = [log for log in behavior_logs if any(keyword in ['technology', 'programming', 'business', 'career', 'work']
                                                         for keyword in log.keywords)]
        if work_logs:
            work_keywords = []
            for log in work_logs:
                work_keywords.extend(log.keywords)

            work_topics = self.extract_topics_from_keywords(work_keywords)
            professional_avatar = {
                "name": "The Professional",
                "description": "Your career-focused identity that seeks growth and knowledge",
                "platform": "Professional/Work Context",
                "emoji": "💼",
                "personality_traits": ["career-focused", "skill-building", "ambitious"],
                "top_interests": list(work_topics.keys())[:3] if work_topics else ["professional-development"],
                "political_lean": "neutral",
                "emotional_tone": "positive",
                "behavior_pattern": f"Focuses on {list(work_topics.keys())[0] if work_topics else 'professional growth'}",
                "strength": len(work_logs) / len(behavior_logs) if behavior_logs else 0
            }
            avatars.append(professional_avatar)

        # Avatar 5: Personal Explorer (based on diverse interests and general browsing)
        personal_logs = [
            log for log in behavior_logs if log.behavior_type in ["visit", "engagement"]]
        if personal_logs:
            personal_keywords = []
            for log in personal_logs:
                personal_keywords.extend(log.keywords)

            personal_topics = self.extract_topics_from_keywords(
                personal_keywords)
            diversity_score = len(set(personal_keywords)) / \
                len(personal_keywords) if personal_keywords else 0

            personal_traits = ["curious"]
            if diversity_score > 0.7:
                personal_traits.append("diverse-interests")
            if len(personal_topics) > 5:
                personal_traits.append("renaissance-minded")

            personal_avatar = {
                "name": "The Explorer",
                "description": "Your genuine self that explores diverse interests and ideas",
                "platform": "General Web/Personal",
                "emoji": "🌟",
                "personality_traits": personal_traits,
                "top_interests": list(personal_topics.keys())[:3] if personal_topics else ["exploration"],
                "political_lean": "balanced",
                "emotional_tone": "curious",
                "behavior_pattern": f"Explores {len(personal_topics)} different topics broadly",
                "strength": len(personal_logs) / len(behavior_logs) if behavior_logs else 0
            }
            avatars.append(personal_avatar)

        # Sort by strength (how much of behavior they represent) and return top 5
        avatars.sort(key=lambda x: x['strength'], reverse=True)
        return avatars[:5]

    async def analyze_user_persona(self,
                                   db: Session,
                                   user_id: int,
                                   days_back: int = 30,
                                   include_sensitive: bool = False) -> Dict[str, Any]:
        """Perform complete persona analysis for a user."""

        # Get behavior logs from specified time period
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)

        query = db.query(BehaviorLog).filter(
            BehaviorLog.user_id == user_id,
            BehaviorLog.timestamp >= cutoff_date,
            BehaviorLog.include_in_analysis == True
        )

        if not include_sensitive:
            query = query.filter(BehaviorLog.is_sensitive == False)

        behavior_logs = query.all()

        if not behavior_logs:
            return {
                "persona_summary": "No behavior data available for analysis. Start browsing with the extension or log some sample behaviors to generate insights.",
                "top_topics": [],
                "personality_traits": [],
                "emotional_tone": {"neutral": 1.0},
                "political_tilt": {"neutral": 1.0},
                "platform_behavior": {},
                "digital_avatars": [],
                "insights": ["Collect more browsing data to generate personalized insights"],
                "data_points_analyzed": 0
            }

        # Extract all keywords from behavior logs
        all_keywords = []
        for log in behavior_logs:
            all_keywords.extend(log.keywords)

        # Perform analysis
        topic_counts = self.extract_topics_from_keywords(all_keywords)
        sentiment_dist = self.analyze_sentiment_distribution(behavior_logs)
        political_dist = self.analyze_political_tilt_distribution(
            behavior_logs)
        personality_traits = self.extract_personality_traits(
            topic_counts, sentiment_dist, political_dist, behavior_logs
        )

        # Build interest network
        interest_map = self.build_interest_network(topic_counts)

        # Analyze platform behavior
        platform_analysis = self.analyze_platform_behavior(behavior_logs)

        # Generate digital avatars
        digital_avatars = self.generate_digital_avatars(
            behavior_logs, platform_analysis)

        # Generate AI summary with enhanced data
        persona_summary = await self.generate_persona_summary(
            topic_counts, sentiment_dist, {
                "total_logs": len(behavior_logs),
                "political_distribution": political_dist,
                "platform_analysis": platform_analysis,
                "digital_avatars": digital_avatars
            }
        )

        # Generate insights
        insights = self._generate_insights(
            topic_counts, sentiment_dist, political_dist, behavior_logs, platform_analysis)

        return {
            "persona_summary": persona_summary,
            "top_topics": list(topic_counts.keys())[:10],
            "personality_traits": personality_traits,
            "emotional_tone": sentiment_dist,
            "political_tilt": political_dist,
            "platform_behavior": platform_analysis,
            "digital_avatars": digital_avatars,
            "interest_map": interest_map,
            "insights": insights,
            "data_points_analyzed": len(behavior_logs)
        }

    def _generate_insights(self,
                           topic_counts: Dict[str, int],
                           sentiment_dist: Dict[str, float],
                           political_dist: Dict[str, float],
                           behavior_logs: List[BehaviorLog],
                           platform_analysis: Dict[str, Any]) -> List[str]:
        """Generate enhanced behavioral insights with political and platform analysis."""
        insights = []

        # Topic insights
        if topic_counts:
            top_topic = max(topic_counts.items(), key=lambda x: x[1])
            insights.append(
                f"Your strongest interest area is {top_topic[0]} with {top_topic[1]} interactions")

        # Sentiment insights
        if sentiment_dist.get("positive", 0) > 0.7:
            insights.append(
                "You tend to engage positively with online content")
        elif sentiment_dist.get("negative", 0) > 0.4:
            insights.append(
                "You engage critically and analytically with content")

        # Political insights
        if political_dist.get("left", 0) > 0.5:
            insights.append(
                "Your content consumption shows a progressive/liberal political lean")
        elif political_dist.get("right", 0) > 0.5:
            insights.append(
                "Your content consumption shows a conservative political lean")
        elif political_dist.get("left", 0) > 0.3 or political_dist.get("right", 0) > 0.3:
            insights.append(
                "You engage with political content from multiple perspectives")

        # Platform-specific insights
        if 'twitter' in platform_analysis:
            twitter_data = platform_analysis['twitter']
            if twitter_data['engagement_types']['likes'] > twitter_data['engagement_types']['views'] * 0.1:
                insights.append(
                    "You're an active Twitter engager who likes content frequently")
            if twitter_data['engagement_types']['retweets'] > 0:
                insights.append(
                    "You amplify content through retweets, showing influence behavior")

        if 'youtube' in platform_analysis:
            youtube_data = platform_analysis['youtube']
            if youtube_data['top_channels']:
                top_channel = youtube_data['top_channels'][0][0]
                insights.append(
                    f"Your most watched YouTube channel is {top_channel}")

        # Diversity insights
        if len(topic_counts) >= 5:
            insights.append(
                "You have diverse interests spanning multiple domains")
        elif len(topic_counts) <= 2:
            insights.append("You have focused, specialized interests")

        # Activity patterns
        search_ratio = len([log for log in behavior_logs if log.behavior_type == "search"]) / len(
            behavior_logs) if behavior_logs else 0
        if search_ratio > 0.6:
            insights.append(
                "You're a research-oriented user who actively searches for information")

        # Social media activity patterns
        social_ratio = len([log for log in behavior_logs if log.behavior_type.startswith('tweet_')]) / len(
            behavior_logs) if behavior_logs else 0
        if social_ratio > 0.3:
            insights.append(
                "You're highly active on social media platforms")

        return insights

    def analyze_algorithm_influence_timeline(self, behavior_logs: List[BehaviorLog], days_back: int = 30) -> Dict[str, Any]:
        """Analyze how algorithms may be influencing user behavior over time."""
        from datetime import datetime, timedelta

        # Group behavior logs by day for timeline analysis
        timeline_data = {}
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)

        # Filter logs to the specified time period
        recent_logs = [
            log for log in behavior_logs if log.timestamp >= cutoff_date]

        # Group by day
        for log in recent_logs:
            day_key = log.timestamp.strftime('%Y-%m-%d')
            if day_key not in timeline_data:
                timeline_data[day_key] = {
                    'political_left': 0,
                    'political_right': 0,
                    'political_neutral': 0,
                    'sentiment_positive': 0,
                    'sentiment_negative': 0,
                    'sentiment_neutral': 0,
                    'total_interactions': 0,
                    'platform_distribution': {},
                    'topic_distribution': {}
                }

            day_data = timeline_data[day_key]
            day_data['total_interactions'] += 1

            # Track political tilt over time
            if log.political_tilt:
                day_data[f'political_{log.political_tilt}'] += 1

            # Track sentiment over time
            if log.sentiment:
                day_data[f'sentiment_{log.sentiment}'] += 1

            # Track platform behavior
            platform_key = self._get_platform_from_log(log)
            if platform_key:
                day_data['platform_distribution'][platform_key] = day_data['platform_distribution'].get(
                    platform_key, 0) + 1

            # Track topic trends
            for keyword in log.keywords:
                for topic, topic_keywords in self.topic_keywords.items():
                    if any(tk in keyword.lower() for tk in topic_keywords):
                        day_data['topic_distribution'][topic] = day_data['topic_distribution'].get(
                            topic, 0) + 1
                        break

        # Convert to timeline format and calculate trends
        timeline_points = []
        political_trend = []
        sentiment_trend = []

        for day, data in sorted(timeline_data.items()):
            if data['total_interactions'] > 0:
                # Calculate proportions for this day
                political_left_pct = (
                    data['political_left'] / data['total_interactions']) * 100
                political_right_pct = (
                    data['political_right'] / data['total_interactions']) * 100
                sentiment_positive_pct = (
                    data['sentiment_positive'] / data['total_interactions']) * 100
                sentiment_negative_pct = (
                    data['sentiment_negative'] / data['total_interactions']) * 100

                timeline_points.append({
                    'date': day,
                    'political_left': political_left_pct,
                    'political_right': political_right_pct,
                    'political_neutral': (data['political_neutral'] / data['total_interactions']) * 100,
                    'sentiment_positive': sentiment_positive_pct,
                    'sentiment_negative': sentiment_negative_pct,
                    'sentiment_neutral': (data['sentiment_neutral'] / data['total_interactions']) * 100,
                    'total_interactions': data['total_interactions'],
                    'platform_distribution': data['platform_distribution'],
                    'topic_distribution': data['topic_distribution']
                })

                # Positive = left lean, negative = right lean
                political_trend.append(
                    political_left_pct - political_right_pct)
                # Positive = positive sentiment dominance
                sentiment_trend.append(
                    sentiment_positive_pct - sentiment_negative_pct)

        # Detect trends and algorithmic influence patterns
        algorithm_influence = self._detect_algorithmic_influence(
            timeline_points, political_trend, sentiment_trend)

        return {
            'timeline_data': timeline_points,
            'political_trend': political_trend,
            'sentiment_trend': sentiment_trend,
            'algorithm_influence': algorithm_influence,
            'analysis_period_days': days_back,
            'total_data_points': len(recent_logs)
        }

    def _get_platform_from_log(self, log: BehaviorLog) -> str:
        """Extract platform name from behavior log."""
        if log.behavior_type.startswith('tweet_'):
            return 'twitter'
        elif log.behavior_type.startswith('youtube_'):
            return 'youtube'
        elif log.behavior_type == 'search':
            return 'search'
        elif log.behavior_type == 'engagement':
            return 'general_web'
        else:
            return 'other'

    def _detect_algorithmic_influence(self, timeline_points: List[Dict], political_trend: List[float], sentiment_trend: List[float]) -> Dict[str, Any]:
        """Detect patterns that suggest algorithmic influence or bias reinforcement."""
        influence_patterns = {
            'bias_reinforcement_detected': False,
            'political_polarization_trend': 'stable',
            'sentiment_manipulation_detected': False,
            'topic_echo_chambers': [],
            'platform_bias_warnings': [],
            'recommendations': []
        }

        if len(political_trend) < 3:
            return influence_patterns

        # Detect political polarization trend
        recent_political = political_trend[-7:]  # Last week
        early_political = political_trend[:7] if len(
            political_trend) >= 14 else political_trend[:len(political_trend)//2]

        if len(recent_political) >= 3 and len(early_political) >= 3:
            recent_avg = sum(recent_political) / len(recent_political)
            early_avg = sum(early_political) / len(early_political)

            polarization_change = abs(recent_avg) - abs(early_avg)

            if polarization_change > 10:  # 10% increase in political lean
                influence_patterns['bias_reinforcement_detected'] = True
                influence_patterns['political_polarization_trend'] = 'increasing'
                influence_patterns['recommendations'].append(
                    "Your content consumption is becoming more politically polarized. Consider diversifying your sources."
                )
            elif polarization_change < -5:  # 5% decrease in political lean
                influence_patterns['political_polarization_trend'] = 'moderating'

        # Detect sentiment manipulation patterns
        recent_sentiment = sentiment_trend[-7:]
        if len(recent_sentiment) >= 3:
            sentiment_volatility = max(
                recent_sentiment) - min(recent_sentiment)
            if sentiment_volatility > 30:  # High sentiment swings
                influence_patterns['sentiment_manipulation_detected'] = True
                influence_patterns['recommendations'].append(
                    "Your emotional responses to content show high volatility. Algorithms may be triggering strong reactions."
                )

        # Detect topic echo chambers
        topic_concentrations = {}
        for point in timeline_points[-7:]:  # Last week
            for topic, count in point.get('topic_distribution', {}).items():
                topic_concentrations[topic] = topic_concentrations.get(
                    topic, 0) + count

        total_topic_interactions = sum(topic_concentrations.values())
        if total_topic_interactions > 0:
            for topic, count in topic_concentrations.items():
                concentration = (count / total_topic_interactions) * 100
                if concentration > 40:  # More than 40% of content in one topic
                    influence_patterns['topic_echo_chambers'].append({
                        'topic': topic,
                        'concentration': concentration,
                        'warning': f"You're seeing {concentration:.1f}% {topic} content - algorithms may be creating an echo chamber"
                    })

        # Platform-specific bias detection
        platform_analysis = {}
        for point in timeline_points[-7:]:
            for platform, count in point.get('platform_distribution', {}).items():
                if platform not in platform_analysis:
                    platform_analysis[platform] = {
                        'political_shifts': [], 'content_counts': []}

                platform_analysis[platform]['content_counts'].append(count)
                # Calculate political lean for this platform on this day
                total_day_interactions = point['total_interactions']
                if total_day_interactions > 0:
                    political_lean = point['political_left'] - \
                        point['political_right']
                    platform_analysis[platform]['political_shifts'].append(
                        political_lean)

        for platform, data in platform_analysis.items():
            if len(data['political_shifts']) >= 3:
                avg_lean = sum(data['political_shifts']) / \
                    len(data['political_shifts'])
                if abs(avg_lean) > 15:  # Strong political bias on this platform
                    influence_patterns['platform_bias_warnings'].append({
                        'platform': platform,
                        'bias_direction': 'left-leaning' if avg_lean > 0 else 'right-leaning',
                        'strength': abs(avg_lean),
                        'warning': f"{platform.title()} is showing you predominantly {('left' if avg_lean > 0 else 'right')}-leaning content"
                    })

        return influence_patterns

    def analyze_topic_bias_detection(self, behavior_logs: List[BehaviorLog], days_back: int = 30) -> Dict[str, Any]:
        """Analyze what topics algorithms are pushing towards the user."""
        from datetime import datetime, timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        recent_logs = [
            log for log in behavior_logs if log.timestamp >= cutoff_date]

        # Analyze topic exposure patterns
        topic_exposure = {}
        platform_topic_bias = {}

        for log in recent_logs:
            platform = self._get_platform_from_log(log)

            # Extract topics from this interaction
            for keyword in log.keywords:
                for topic, topic_keywords in self.topic_keywords.items():
                    if any(tk in keyword.lower() for tk in topic_keywords):
                        # Overall topic exposure
                        if topic not in topic_exposure:
                            topic_exposure[topic] = {
                                'total_count': 0,
                                'platform_breakdown': {},
                                'sentiment_breakdown': {'positive': 0, 'negative': 0, 'neutral': 0},
                                'political_breakdown': {'left': 0, 'right': 0, 'neutral': 0}
                            }

                        topic_data = topic_exposure[topic]
                        topic_data['total_count'] += 1

                        # Platform breakdown
                        topic_data['platform_breakdown'][platform] = topic_data['platform_breakdown'].get(
                            platform, 0) + 1

                        # Sentiment breakdown
                        if log.sentiment:
                            topic_data['sentiment_breakdown'][log.sentiment] += 1

                        # Political breakdown
                        if log.political_tilt:
                            topic_data['political_breakdown'][log.political_tilt] += 1

                        # Platform-specific topic bias
                        if platform not in platform_topic_bias:
                            platform_topic_bias[platform] = {}
                        platform_topic_bias[platform][topic] = platform_topic_bias[platform].get(
                            topic, 0) + 1

                        break

        # Calculate bias scores and recommendations
        total_interactions = len(recent_logs)
        biased_topics = []
        algorithmic_push_detected = []

        for topic, data in topic_exposure.items():
            topic_percentage = (
                data['total_count'] / total_interactions) * 100 if total_interactions > 0 else 0

            # Detect if this topic is being pushed disproportionately
            if topic_percentage > 20:  # More than 20% of all content
                # Analyze the sentiment bias in this topic
                sentiment_bias = self._calculate_sentiment_bias(
                    data['sentiment_breakdown'])
                political_bias = self._calculate_political_bias(
                    data['political_breakdown'])

                algorithmic_push_detected.append({
                    'topic': topic,
                    'exposure_percentage': topic_percentage,
                    'sentiment_bias': sentiment_bias,
                    'political_bias': political_bias,
                    'platform_breakdown': data['platform_breakdown'],
                    'warning': f"You're seeing unusually high amounts of {topic} content ({topic_percentage:.1f}%)"
                })

        # Detect cross-platform topic coordination (same topics pushed everywhere)
        coordinated_topics = self._detect_coordinated_topic_pushing(
            platform_topic_bias)

        return {
            'topic_exposure': topic_exposure,
            'algorithmic_push_detected': algorithmic_push_detected,
            'coordinated_topics': coordinated_topics,
            'platform_topic_bias': platform_topic_bias,
            'total_interactions_analyzed': total_interactions,
            'analysis_period_days': days_back
        }

    def _calculate_sentiment_bias(self, sentiment_breakdown: Dict[str, int]) -> Dict[str, Any]:
        """Calculate sentiment bias in topic exposure."""
        total = sum(sentiment_breakdown.values())
        if total == 0:
            return {'bias_detected': False, 'dominant_sentiment': 'neutral', 'bias_strength': 0}

        sentiment_percentages = {
            k: (v / total) * 100 for k, v in sentiment_breakdown.items()}
        dominant_sentiment = max(
            sentiment_percentages, key=sentiment_percentages.get)
        bias_strength = sentiment_percentages[dominant_sentiment]

        return {
            'bias_detected': bias_strength > 60,  # More than 60% of one sentiment
            'dominant_sentiment': dominant_sentiment,
            'bias_strength': bias_strength,
            'distribution': sentiment_percentages
        }

    def _calculate_political_bias(self, political_breakdown: Dict[str, int]) -> Dict[str, Any]:
        """Calculate political bias in topic exposure."""
        total = sum(political_breakdown.values())
        if total == 0:
            return {'bias_detected': False, 'dominant_lean': 'neutral', 'bias_strength': 0}

        political_percentages = {
            k: (v / total) * 100 for k, v in political_breakdown.items()}
        dominant_lean = max(political_percentages,
                            key=political_percentages.get)
        bias_strength = political_percentages[dominant_lean]

        return {
            'bias_detected': bias_strength > 60,  # More than 60% of one political lean
            'dominant_lean': dominant_lean,
            'bias_strength': bias_strength,
            'distribution': political_percentages
        }

    def _detect_coordinated_topic_pushing(self, platform_topic_bias: Dict[str, Dict[str, int]]) -> List[Dict[str, Any]]:
        """Detect topics being pushed across multiple platforms simultaneously."""
        coordinated_topics = []

        # Find topics that appear heavily across multiple platforms
        topic_platform_count = {}
        for platform, topics in platform_topic_bias.items():
            for topic, count in topics.items():
                if topic not in topic_platform_count:
                    topic_platform_count[topic] = {
                        'platforms': [], 'total_count': 0}

                topic_platform_count[topic]['platforms'].append({
                    'platform': platform,
                    'count': count
                })
                topic_platform_count[topic]['total_count'] += count

        for topic, data in topic_platform_count.items():
            # Appears on 2+ platforms with significant volume
            if len(data['platforms']) >= 2 and data['total_count'] >= 10:
                # Check if the distribution is suspiciously even across platforms
                platform_counts = [p['count'] for p in data['platforms']]
                avg_count = sum(platform_counts) / len(platform_counts)
                variance = sum(
                    (count - avg_count) ** 2 for count in platform_counts) / len(platform_counts)

                if variance < avg_count * 0.5:  # Low variance = suspiciously even distribution
                    coordinated_topics.append({
                        'topic': topic,
                        'platforms': [p['platform'] for p in data['platforms']],
                        'total_exposure': data['total_count'],
                        'coordination_strength': (avg_count / variance) if variance > 0 else float('inf'),
                        'warning': f"{topic.title()} content is being pushed consistently across {len(data['platforms'])} platforms"
                    })

        return coordinated_topics

    def generate_perception_analysis(self, behavior_logs: List[BehaviorLog], persona_profile: Dict[str, Any], perceiver_type: str) -> Dict[str, Any]:
        """Generate analysis of how a specific type of person would perceive the user."""

        # Extract key behavioral patterns
        all_keywords = []
        content_samples = []
        platform_activity = {}
        time_patterns = {}

        for log in behavior_logs:
            all_keywords.extend(log.keywords)
            if log.content:
                content_samples.append(log.content)

            # Track platform usage
            platform = self._get_platform_from_log(log)
            platform_activity[platform] = platform_activity.get(
                platform, 0) + 1

            # Track time patterns
            hour = log.timestamp.hour
            time_patterns[hour] = time_patterns.get(hour, 0) + 1

        # Analyze topics and interests
        topic_counts = self.extract_topics_from_keywords(all_keywords)
        sentiment_dist = self.analyze_sentiment_distribution(behavior_logs)
        political_dist = self.analyze_political_tilt_distribution(
            behavior_logs)

        # Generate perceiver-specific analysis
        if perceiver_type == "advertiser":
            return self._generate_advertiser_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "content_feeder":
            return self._generate_content_feeder_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "data_broker":
            return self._generate_data_broker_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "ai_system":
            return self._generate_ai_system_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        # Keep legacy support for now
        elif perceiver_type == "recruiter":
            return self._generate_recruiter_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "romantic_partner":
            return self._generate_romantic_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "colleague":
            return self._generate_colleague_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        elif perceiver_type == "family_member":
            return self._generate_family_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )
        else:
            return self._generate_general_perception(
                topic_counts, sentiment_dist, political_dist,
                platform_activity, time_patterns, content_samples, persona_profile
            )

    def _generate_recruiter_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                       political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                       time_patterns: Dict[int, int], content_samples: List[str],
                                       persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a recruiter would perceive this person."""

        perception = {
            "perceiver_type": "recruiter",
            "overall_impression": "neutral",
            "hire_likelihood": 50,  # Percentage
            "strengths": [],
            "concerns": [],
            "red_flags": [],
            "recommendations": [],
            "detailed_analysis": {},
            "professional_score": 0
        }

        professional_score = 0

        # Analyze professional interests
        professional_topics = ["technology", "career", "education", "finance"]
        professional_interest = sum(topic_counts.get(topic, 0)
                                    for topic in professional_topics)
        total_interactions = sum(topic_counts.values()) if topic_counts else 1

        if professional_interest / total_interactions > 0.6:
            perception["strengths"].append(
                "Strong focus on professional development and industry knowledge")
            professional_score += 20
        elif professional_interest / total_interactions > 0.3:
            perception["strengths"].append(
                "Good balance of professional and personal interests")
            professional_score += 10
        else:
            perception["concerns"].append(
                "Limited evidence of professional interests or industry engagement")
            professional_score -= 10

        # Analyze online behavior patterns
        if platform_activity.get("search", 0) > platform_activity.get("twitter", 0):
            perception["strengths"].append(
                "Research-oriented mindset, likely to be self-directed learner")
            professional_score += 15

        # Check for concerning political activity
        if political_dist.get("left", 0) > 0.7 or political_dist.get("right", 0) > 0.7:
            perception["concerns"].append(
                "Heavily politically engaged - may bring divisive viewpoints to workplace")
            professional_score -= 15
        elif political_dist.get("left", 0) > 0.4 or political_dist.get("right", 0) > 0.4:
            perception["strengths"].append("Engaged citizen with clear values")
            professional_score += 5

        # Analyze sentiment patterns
        if sentiment_dist.get("negative", 0) > 0.5:
            perception["concerns"].append(
                "Frequently negative or critical online - may impact team morale")
            professional_score -= 20
        elif sentiment_dist.get("positive", 0) > 0.6:
            perception["strengths"].append(
                "Positive online presence suggests good attitude and team fit")
            professional_score += 15

        # Check time patterns for work-life balance
        work_hours = sum(time_patterns.get(hour, 0)
                         for hour in range(9, 18))  # 9 AM to 6 PM
        total_activity = sum(time_patterns.values()) if time_patterns else 1

        if work_hours / total_activity > 0.7:
            perception["concerns"].append(
                "Heavy internet usage during work hours - potential productivity concerns")
            professional_score -= 15
        elif work_hours / total_activity < 0.3:
            perception["strengths"].append("Good work-life digital boundaries")
            professional_score += 10

        # Look for red flags in content
        red_flag_keywords = ["hate", "discriminat",
                             "illegal", "fired", "lawsuit", "drunk", "party"]
        for sample in content_samples[:10]:  # Check recent content
            if any(flag in sample.lower() for flag in red_flag_keywords):
                perception["red_flags"].append(
                    "Potentially concerning language or behavior patterns in online content")
                professional_score -= 25
                break

        # Technology engagement
        if topic_counts.get("technology", 0) > sum(topic_counts.values()) * 0.2:
            perception["strengths"].append(
                "Tech-savvy, likely adaptable to new digital tools and systems")
            professional_score += 10

        # Calculate final scores
        perception["professional_score"] = max(
            0, min(100, professional_score + 50))
        perception["hire_likelihood"] = perception["professional_score"]

        if perception["hire_likelihood"] >= 75:
            perception["overall_impression"] = "very_positive"
        elif perception["hire_likelihood"] >= 60:
            perception["overall_impression"] = "positive"
        elif perception["hire_likelihood"] >= 40:
            perception["overall_impression"] = "neutral"
        else:
            perception["overall_impression"] = "concerning"

        # Generate recommendations
        if professional_score < 40:
            perception["recommendations"].append(
                "Consider sharing more professional achievements and industry insights")
            perception["recommendations"].append(
                "Engage with thought leaders and professional content in your field")

        if sentiment_dist.get("negative", 0) > 0.4:
            perception["recommendations"].append(
                "Balance critical posts with more positive, solution-oriented content")

        if not any(platform in platform_activity for platform in ["search", "youtube"]):
            perception["recommendations"].append(
                "Demonstrate continuous learning through educational content engagement")

        perception["detailed_analysis"] = {
            "professional_interests": f"{(professional_interest / total_interactions * 100):.1f}% of content",
            "political_engagement": political_dist,
            "sentiment_profile": sentiment_dist,
            "platform_usage": platform_activity,
            "content_professionalism": "High" if not perception["red_flags"] else "Concerning"
        }

        return perception

    def _generate_romantic_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                      political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                      time_patterns: Dict[int, int], content_samples: List[str],
                                      persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a potential romantic partner would perceive this person."""

        perception = {
            "perceiver_type": "romantic_partner",
            "overall_impression": "neutral",
            "compatibility_score": 50,  # Percentage
            "attractive_qualities": [],
            "potential_concerns": [],
            "red_flags": [],
            "relationship_insights": [],
            "detailed_analysis": {}
        }

        compatibility_score = 0

        # Analyze emotional intelligence and communication
        if sentiment_dist.get("positive", 0) > 0.5:
            perception["attractive_qualities"].append(
                "Positive outlook and optimistic personality")
            compatibility_score += 15
        elif sentiment_dist.get("negative", 0) > 0.6:
            perception["potential_concerns"].append(
                "Frequently negative online - may indicate pessimistic worldview")
            compatibility_score -= 20

        # Check for balanced interests
        total_interactions = sum(topic_counts.values()) if topic_counts else 1
        entertainment_ratio = topic_counts.get(
            "entertainment", 0) / total_interactions
        lifestyle_ratio = topic_counts.get("lifestyle", 0) / total_interactions

        if entertainment_ratio > 0.3 or lifestyle_ratio > 0.2:
            perception["attractive_qualities"].append(
                "Enjoys entertainment and lifestyle content - likely fun to be around")
            compatibility_score += 10

        # Health and wellness interests
        if topic_counts.get("health", 0) > 0:
            perception["attractive_qualities"].append(
                "Health-conscious lifestyle choices")
            compatibility_score += 10

        # Look for relationship red flags
        red_flag_patterns = ["ex-", "dating app", "hookup",
                             "single", "breakup", "toxic", "cheating"]
        relationship_content_count = 0
        for sample in content_samples[:15]:
            if any(pattern in sample.lower() for pattern in red_flag_patterns):
                relationship_content_count += 1

        if relationship_content_count > 3:
            perception["red_flags"].append(
                "Frequent mentions of dating/relationship drama - may indicate instability")
            compatibility_score -= 25
        elif relationship_content_count == 0:
            perception["attractive_qualities"].append(
                "Discrete about personal relationships - respects privacy")
            compatibility_score += 5

        # Political compatibility assessment
        extreme_political = political_dist.get(
            "left", 0) > 0.8 or political_dist.get("right", 0) > 0.8
        if extreme_political:
            perception["potential_concerns"].append(
                "Strong political views may create relationship friction if values don't align")
            compatibility_score -= 10
        elif political_dist.get("left", 0) > 0.3 or political_dist.get("right", 0) > 0.3:
            perception["attractive_qualities"].append(
                "Has values and principles - likely thoughtful partner")
            compatibility_score += 8

        # Social media usage patterns
        social_platforms = ["twitter", "instagram"]
        social_activity = sum(platform_activity.get(platform, 0)
                              for platform in social_platforms)
        total_activity = sum(platform_activity.values()
                             ) if platform_activity else 1

        if social_activity / total_activity > 0.7:
            perception["potential_concerns"].append(
                "Heavy social media usage - may prioritize online validation over real connections")
            compatibility_score -= 15
        elif social_activity / total_activity < 0.2:
            perception["attractive_qualities"].append(
                "Not overly focused on social media - likely present in real-life interactions")
            compatibility_score += 10

        # Intellectual curiosity
        if topic_counts.get("education", 0) > 0 or platform_activity.get("search", 0) > total_activity * 0.3:
            perception["attractive_qualities"].append(
                "Curious and learning-oriented - interesting conversation partner")
            compatibility_score += 12

        # Time availability patterns
        evening_activity = sum(time_patterns.get(hour, 0)
                               for hour in range(18, 23))  # 6 PM to 11 PM
        if evening_activity / sum(time_patterns.values()) > 0.4 if time_patterns else False:
            perception["potential_concerns"].append(
                "Heavy internet usage during evening hours - may limit quality time together")
            compatibility_score -= 10

        # Look for creative/artistic interests
        creative_keywords = ["art", "music", "creative",
                             "design", "photography", "writing"]
        creative_content = sum(1 for sample in content_samples if any(
            word in sample.lower() for word in creative_keywords))
        if creative_content > 2:
            perception["attractive_qualities"].append(
                "Creative interests and artistic appreciation")
            compatibility_score += 8

        # Calculate final scores
        perception["compatibility_score"] = max(
            0, min(100, compatibility_score + 50))

        if perception["compatibility_score"] >= 75:
            perception["overall_impression"] = "very_attractive"
        elif perception["compatibility_score"] >= 60:
            perception["overall_impression"] = "attractive"
        elif perception["compatibility_score"] >= 40:
            perception["overall_impression"] = "neutral"
        else:
            perception["overall_impression"] = "concerning"

        # Generate relationship insights
        if sentiment_dist.get("positive", 0) > 0.6:
            perception["relationship_insights"].append(
                "Likely to bring positivity and joy to a relationship")

        if political_dist.get("neutral", 0) > 0.6:
            perception["relationship_insights"].append(
                "Balanced political views suggest open-mindedness and flexibility")

        if topic_counts.get("technology", 0) > total_interactions * 0.3:
            perception["relationship_insights"].append(
                "Tech-savvy partner who can help with digital challenges")

        perception["detailed_analysis"] = {
            "emotional_tone": sentiment_dist,
            "political_alignment": political_dist,
            "social_media_engagement": f"{(social_activity / total_activity * 100):.1f}% of activity",
            "interests_diversity": len(topic_counts),
            "relationship_discretion": "High" if relationship_content_count == 0 else "Low"
        }

        return perception

    def _generate_colleague_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                       political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                       time_patterns: Dict[int, int], content_samples: List[str],
                                       persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a colleague would perceive this person."""

        perception = {
            "perceiver_type": "colleague",
            "overall_impression": "neutral",
            "collaboration_score": 50,
            "team_fit_qualities": [],
            "potential_friction": [],
            "communication_style": "unknown",
            "detailed_analysis": {}
        }

        collaboration_score = 0

        # Analyze communication patterns
        if sentiment_dist.get("positive", 0) > 0.5:
            perception["team_fit_qualities"].append(
                "Positive communicator - likely to boost team morale")
            perception["communication_style"] = "supportive"
            collaboration_score += 15
        elif sentiment_dist.get("negative", 0) > 0.5:
            perception["potential_friction"].append(
                "Often critical or negative - may create tense work environment")
            perception["communication_style"] = "critical"
            collaboration_score -= 15
        else:
            perception["communication_style"] = "balanced"
            collaboration_score += 5

        # Professional interests alignment
        work_related = topic_counts.get(
            "technology", 0) + topic_counts.get("career", 0) + topic_counts.get("education", 0)
        total_interests = sum(topic_counts.values()) if topic_counts else 1

        if work_related / total_interests > 0.4:
            perception["team_fit_qualities"].append(
                "Strong professional interests - valuable team contributor")
            collaboration_score += 20

        # Political considerations for workplace
        if political_dist.get("left", 0) > 0.7 or political_dist.get("right", 0) > 0.7:
            perception["potential_friction"].append(
                "Strong political views may create workplace tension")
            collaboration_score -= 10

        perception["collaboration_score"] = max(
            0, min(100, collaboration_score + 50))

        if perception["collaboration_score"] >= 70:
            perception["overall_impression"] = "excellent_colleague"
        elif perception["collaboration_score"] >= 55:
            perception["overall_impression"] = "good_colleague"
        elif perception["collaboration_score"] >= 40:
            perception["overall_impression"] = "neutral"
        else:
            perception["overall_impression"] = "challenging_colleague"

        return perception

    def _generate_family_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                    political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                    time_patterns: Dict[int, int], content_samples: List[str],
                                    persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a family member would perceive this person."""

        perception = {
            "perceiver_type": "family_member",
            "overall_impression": "neutral",
            "family_harmony_score": 50,
            "positive_traits": [],
            "family_concerns": [],
            "generational_insights": [],
            "detailed_analysis": {}
        }

        harmony_score = 0

        # Analyze family-appropriate content
        if sentiment_dist.get("positive", 0) > 0.5:
            perception["positive_traits"].append(
                "Generally positive outlook - pleasant to be around at family gatherings")
            harmony_score += 15

        # Check for concerning content
        concerning_keywords = ["party", "drunk", "wild", "inappropriate"]
        concerning_content = sum(1 for sample in content_samples if any(
            word in sample.lower() for word in concerning_keywords))

        if concerning_content > 2:
            perception["family_concerns"].append(
                "Some content may be concerning to traditional family values")
            harmony_score -= 20

        # Political family dynamics
        if political_dist.get("left", 0) > 0.6 or political_dist.get("right", 0) > 0.6:
            perception["generational_insights"].append(
                "Strong political views may clash with some family members")
            harmony_score -= 5

        perception["family_harmony_score"] = max(
            0, min(100, harmony_score + 50))

        return perception

    def _generate_general_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                     political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                     time_patterns: Dict[int, int], content_samples: List[str],
                                     persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a general perception analysis."""

        return {
            "perceiver_type": "general_public",
            "overall_impression": "neutral",
            "public_perception_score": 50,
            "strengths": ["Authentic online presence"],
            "areas_for_improvement": ["Consider audience when posting"],
            "detailed_analysis": {
                "sentiment_distribution": sentiment_dist,
                "topic_interests": topic_counts,
                "platform_activity": platform_activity
            }
        }

    def _generate_advertiser_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                        political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                        time_patterns: Dict[int, int], content_samples: List[str],
                                        persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how an advertiser would perceive this person for targeting."""

        perception = {
            "perceiver_type": "advertiser",
            "overall_impression": "neutral",
            "targeting_value": 50,  # Percentage
            "valuable_signals": [],
            "ad_resistance": [],
            "red_flags": [],
            "recommendations": [],
            "detailed_analysis": {}
        }

        targeting_score = 0
        total_interactions = sum(topic_counts.values()) if topic_counts else 1

        # Analyze purchase intent signals
        purchase_topics = ["technology", "health", "finance", "lifestyle"]
        purchase_signals = sum(topic_counts.get(topic, 0)
                               for topic in purchase_topics)

        if purchase_signals / total_interactions > 0.5:
            perception["valuable_signals"].append(
                "Strong consumer interest signals across multiple categories")
            targeting_score += 20

        # Analyze engagement patterns for ad timing
        peak_hours = max(time_patterns.items(),
                         key=lambda x: x[1]) if time_patterns else (12, 0)
        if peak_hours[1] > 0:
            perception["valuable_signals"].append(
                f"Predictable online activity pattern - most active around {peak_hours[0]:02d}:00")
            targeting_score += 15

        # Check for brand loyalty vs switching behavior
        platform_diversity = len(platform_activity)
        if platform_diversity > 3:
            perception["valuable_signals"].append(
                "Multi-platform user - high reach potential")
            targeting_score += 10
        elif platform_diversity == 1:
            perception["ad_resistance"].append(
                "Limited platform engagement - harder to reach")
            targeting_score -= 10

        # Sentiment analysis for ad receptivity
        if sentiment_dist.get("positive", 0) > 0.6:
            perception["valuable_signals"].append(
                "Positive sentiment suggests higher ad receptivity")
            targeting_score += 15
        elif sentiment_dist.get("negative", 0) > 0.5:
            perception["ad_resistance"].append(
                "Frequently negative sentiment may resist advertising")
            targeting_score -= 15

        # Political engagement (affects ad content restrictions)
        if political_dist.get("left", 0) > 0.6 or political_dist.get("right", 0) > 0.6:
            perception["ad_resistance"].append(
                "Strong political views limit acceptable ad content")
            targeting_score -= 10

        # Content analysis for interests
        interest_diversity = len(topic_counts)
        if interest_diversity > 5:
            perception["valuable_signals"].append(
                "Diverse interests enable broad targeting opportunities")
            targeting_score += 12

        # Check for ad-blocking behavior signals
        tech_savvy = topic_counts.get(
            "technology", 0) / total_interactions if total_interactions > 0 else 0
        if tech_savvy > 0.3:
            perception["ad_resistance"].append(
                "Tech-savvy user likely uses ad blockers")
            targeting_score -= 20

        # Calculate final score
        perception["targeting_value"] = max(0, min(100, targeting_score + 50))

        if perception["targeting_value"] >= 75:
            perception["overall_impression"] = "high_value"
        elif perception["targeting_value"] >= 60:
            perception["overall_impression"] = "valuable"
        elif perception["targeting_value"] >= 40:
            perception["overall_impression"] = "neutral"
        else:
            perception["overall_impression"] = "low_value"

        # Generate recommendations
        if targeting_score < 40:
            perception["recommendations"].append(
                "Increase engagement signals through interactive content")
            perception["recommendations"].append(
                "Build stronger consumer intent signals")

        perception["detailed_analysis"] = {
            "purchase_intent": f"{(purchase_signals / total_interactions * 100):.1f}% purchase-related content",
            "sentiment_profile": sentiment_dist,
            "platform_reach": platform_activity,
            "peak_activity_hour": peak_hours[0] if peak_hours[1] > 0 else "Unknown"
        }

        return perception

    def _generate_content_feeder_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                            political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                            time_patterns: Dict[int, int], content_samples: List[str],
                                            persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a content recommendation algorithm would perceive this user."""

        perception = {
            "perceiver_type": "content_feeder",
            "overall_impression": "neutral",
            "engagement_score": 50,
            "engagement_drivers": [],
            "algorithm_challenges": [],
            "red_flags": [],
            "recommendations": [],
            "detailed_analysis": {}
        }

        engagement_score = 0
        total_interactions = sum(topic_counts.values()) if topic_counts else 1

        # Analyze content consumption patterns
        top_topic = max(topic_counts.items(),
                        key=lambda x: x[1]) if topic_counts else ("unknown", 0)
        if top_topic[1] / total_interactions > 0.4:
            perception["engagement_drivers"].append(
                f"Strong preference for {top_topic[0]} content - high engagement probability")
            engagement_score += 20

        # Check for binge-watching/reading patterns
        session_patterns = list(time_patterns.values())
        if session_patterns and max(session_patterns) > sum(session_patterns) * 0.3:
            perception["engagement_drivers"].append(
                "Concentrated usage patterns - good for session-based recommendations")
            engagement_score += 15

        # Sentiment consistency for content matching
        dominant_sentiment = max(sentiment_dist.items(
        ), key=lambda x: x[1]) if sentiment_dist else ("neutral", 0)
        if dominant_sentiment[1] > 0.6:
            perception["engagement_drivers"].append(
                f"Consistent {dominant_sentiment[0]} content preference")
            engagement_score += 10
        elif max(sentiment_dist.values()) < 0.4:
            perception["algorithm_challenges"].append(
                "Inconsistent sentiment preferences make content matching difficult")
            engagement_score -= 15

        # Platform loyalty analysis
        if len(platform_activity) == 1:
            perception["engagement_drivers"].append(
                "Single platform focus - consistent engagement context")
            engagement_score += 12
        elif len(platform_activity) > 4:
            perception["algorithm_challenges"].append(
                "Multi-platform behavior creates fragmented user profile")
            engagement_score -= 10

        # Interest diversity vs depth
        interest_depth = max(topic_counts.values()) / \
            total_interactions if total_interactions > 0 else 0
        interest_breadth = len(topic_counts)

        if interest_depth > 0.5 and interest_breadth < 4:
            perception["engagement_drivers"].append(
                "Deep interest in few topics - easy to serve relevant content")
            engagement_score += 18
        elif interest_breadth > 7 and interest_depth < 0.3:
            perception["algorithm_challenges"].append(
                "Broad but shallow interests make targeting difficult")
            engagement_score -= 12

        # Political content challenges
        if political_dist.get("left", 0) > 0.7 or political_dist.get("right", 0) > 0.7:
            perception["algorithm_challenges"].append(
                "Strong political bias requires careful content curation")
            engagement_score -= 10

        # Calculate final score
        perception["engagement_score"] = max(
            0, min(100, engagement_score + 50))

        if perception["engagement_score"] >= 75:
            perception["overall_impression"] = "highly_predictable"
        elif perception["engagement_score"] >= 60:
            perception["overall_impression"] = "targetable"
        elif perception["engagement_score"] >= 40:
            perception["overall_impression"] = "neutral"
        else:
            perception["overall_impression"] = "unpredictable"

        perception["detailed_analysis"] = {
            "primary_interest": top_topic[0],
            "interest_concentration": f"{(interest_depth * 100):.1f}%",
            "platform_distribution": platform_activity,
            "content_preference_strength": dominant_sentiment[1]
        }

        return perception

    def _generate_data_broker_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                         political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                         time_patterns: Dict[int, int], content_samples: List[str],
                                         persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how a data broker would value this user's information."""

        perception = {
            "perceiver_type": "data_broker",
            "overall_impression": "neutral",
            "data_value": 50,
            "profitable_traits": [],
            "data_gaps": [],
            "red_flags": [],
            "recommendations": [],
            "detailed_analysis": {}
        }

        data_score = 0
        total_interactions = sum(topic_counts.values()) if topic_counts else 1

        # High-value demographic indicators
        valuable_topics = ["finance", "health", "technology", "career"]
        valuable_signals = sum(topic_counts.get(topic, 0)
                               for topic in valuable_topics)

        if valuable_signals / total_interactions > 0.4:
            perception["profitable_traits"].append(
                "High-value demographic signals in finance, health, and technology")
            data_score += 25

        # Behavioral predictability (valuable for modeling)
        time_consistency = max(time_patterns.values()) / \
            sum(time_patterns.values()) if time_patterns else 0
        if time_consistency > 0.3:
            perception["profitable_traits"].append(
                "Predictable behavior patterns valuable for modeling")
            data_score += 15

        # Purchase intent signals
        shopping_keywords = ["buy", "purchase", "review", "price", "deal"]
        purchase_signals = sum(1 for sample in content_samples if any(
            keyword in sample.lower() for keyword in shopping_keywords))

        if purchase_signals > len(content_samples) * 0.2:
            perception["profitable_traits"].append(
                "Strong purchase intent signals")
            data_score += 20

        # Location/mobility data (implied from platform usage)
        mobile_indicators = platform_activity.get(
            "mobile", 0) / sum(platform_activity.values()) if platform_activity else 0
        if mobile_indicators > 0.5:
            perception["profitable_traits"].append(
                "High mobile usage suggests location data availability")
            data_score += 12

        # Data completeness assessment
        data_richness = len(topic_counts) + \
            len(platform_activity) + (1 if time_patterns else 0)
        if data_richness < 5:
            perception["data_gaps"].append(
                "Limited data points reduce profile completeness")
            data_score -= 15

        # Privacy-conscious behavior detection
        tech_usage = topic_counts.get(
            "technology", 0) / total_interactions if total_interactions > 0 else 0
        if tech_usage > 0.3:
            perception["data_gaps"].append(
                "Tech-savvy users likely use privacy tools, limiting data collection")
            data_score -= 20

        # Sentiment stability (affects data reliability)
        sentiment_volatility = max(sentiment_dist.values(
        )) - min(sentiment_dist.values()) if sentiment_dist else 0
        if sentiment_volatility > 0.4:
            perception["data_gaps"].append(
                "High sentiment volatility reduces data reliability")
            data_score -= 10

        # Multi-platform presence increases data value
        if len(platform_activity) > 3:
            perception["profitable_traits"].append(
                "Multi-platform presence enables cross-platform tracking")
            data_score += 15

        # Calculate final score
        perception["data_value"] = max(0, min(100, data_score + 50))

        if perception["data_value"] >= 75:
            perception["overall_impression"] = "premium_profile"
        elif perception["data_value"] >= 60:
            perception["overall_impression"] = "valuable_data"
        elif perception["data_value"] >= 40:
            perception["overall_impression"] = "standard_profile"
        else:
            perception["overall_impression"] = "limited_value"

        perception["detailed_analysis"] = {
            "demographic_value": f"{(valuable_signals / total_interactions * 100):.1f}% high-value signals",
            "behavioral_predictability": f"{(time_consistency * 100):.1f}%",
            "data_completeness": f"{data_richness}/10 data dimensions",
            "cross_platform_trackability": len(platform_activity)
        }

        return perception

    def _generate_ai_system_perception(self, topic_counts: Dict[str, int], sentiment_dist: Dict[str, float],
                                       political_dist: Dict[str, float], platform_activity: Dict[str, int],
                                       time_patterns: Dict[int, int], content_samples: List[str],
                                       persona_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate how an AI system would classify and understand this user."""

        perception = {
            "perceiver_type": "ai_system",
            "overall_impression": "neutral",
            "ai_confidence": 50,
            "ai_advantages": [],
            "ai_limitations": [],
            "red_flags": [],
            "recommendations": [],
            "detailed_analysis": {}
        }

        confidence_score = 0
        total_interactions = sum(topic_counts.values()) if topic_counts else 1

        # Data volume affects AI confidence
        if total_interactions > 100:
            perception["ai_advantages"].append(
                "Sufficient data volume for reliable AI analysis")
            confidence_score += 20
        elif total_interactions < 20:
            perception["ai_limitations"].append(
                "Limited data volume reduces AI prediction accuracy")
            confidence_score -= 25

        # Pattern consistency
        if topic_counts:
            topic_distribution_entropy = -sum((count/total_interactions) *
                                              (count/total_interactions).bit_length()
                                              for count in topic_counts.values() if count > 0)

            if topic_distribution_entropy < 2:  # Low entropy = consistent patterns
                perception["ai_advantages"].append(
                    "Consistent behavioral patterns enable accurate predictions")
                confidence_score += 15
            elif topic_distribution_entropy > 4:  # High entropy = random behavior
                perception["ai_limitations"].append(
                    "Highly random behavior patterns challenge AI modeling")
                confidence_score -= 15

        # Sentiment consistency for emotional AI
        sentiment_consistency = max(
            sentiment_dist.values()) if sentiment_dist else 0
        if sentiment_consistency > 0.7:
            perception["ai_advantages"].append(
                "Consistent emotional patterns improve sentiment analysis accuracy")
            confidence_score += 12
        elif sentiment_consistency < 0.4:
            perception["ai_limitations"].append(
                "Inconsistent emotional patterns complicate sentiment modeling")
            confidence_score -= 10

        # Temporal pattern recognition
        if time_patterns:
            time_variance = max(time_patterns.values()) / \
                sum(time_patterns.values())
            if time_variance > 0.4:
                perception["ai_advantages"].append(
                    "Strong temporal patterns enable time-based predictions")
                confidence_score += 10

        # Multi-modal data availability
        data_dimensions = len([d for d in [topic_counts, sentiment_dist,
                              political_dist, platform_activity, time_patterns] if d])
        if data_dimensions >= 4:
            perception["ai_advantages"].append(
                "Multi-dimensional data enables sophisticated AI modeling")
            confidence_score += 15
        elif data_dimensions < 3:
            perception["ai_limitations"].append(
                "Limited data dimensions constrain AI model complexity")
            confidence_score -= 12

        # Adversarial behavior detection
        tech_sophistication = topic_counts.get(
            "technology", 0) / total_interactions if total_interactions > 0 else 0
        if tech_sophistication > 0.4:
            perception["ai_limitations"].append(
                "High tech sophistication may indicate AI-aware behavior")
            confidence_score -= 15

        # Anomaly detection capability
        if len(content_samples) > 10:
            perception["ai_advantages"].append(
                "Sufficient content samples for anomaly detection")
            confidence_score += 8

        # Calculate final score
        perception["ai_confidence"] = max(0, min(100, confidence_score + 50))

        if perception["ai_confidence"] >= 80:
            perception["overall_impression"] = "high_confidence"
        elif perception["ai_confidence"] >= 65:
            perception["overall_impression"] = "reliable_predictions"
        elif perception["ai_confidence"] >= 40:
            perception["overall_impression"] = "moderate_accuracy"
        else:
            perception["overall_impression"] = "low_confidence"

        perception["detailed_analysis"] = {
            "data_volume": total_interactions,
            "pattern_consistency": f"{(sentiment_consistency * 100):.1f}%",
            "data_dimensions": data_dimensions,
            "temporal_predictability": f"{(time_variance * 100):.1f}%" if time_patterns else "Unknown"
        }

        return perception

    async def generate_ai_perception_feedback(self, perception_data: Dict[str, Any], behavior_logs: List[BehaviorLog]) -> str:
        """Generate AI-powered feedback on how others perceive the user."""

        perceiver_type = perception_data.get("perceiver_type", "unknown")
        score_key = {
            "advertiser": "targeting_value",
            "content_feeder": "engagement_score",
            "data_broker": "data_value",
            "ai_system": "ai_confidence",
            "recruiter": "hire_likelihood",
            "romantic_partner": "compatibility_score",
            "colleague": "collaboration_score",
            "family_member": "family_harmony_score"
        }.get(perceiver_type, "public_perception_score")

        score = perception_data.get(score_key, 50)

        # Create AI prompt based on perception data
        if perceiver_type == "advertiser":
            prompt = f"""Based on this person's digital behavior analysis, provide feedback on their advertising profile:

Score: {score}/100
Valuable Signals: {', '.join(perception_data.get('valuable_signals', []))}
Ad Resistance: {', '.join(perception_data.get('ad_resistance', []))}

Write a 2-3 sentence assessment focusing on:
1. How valuable this person is for targeted advertising
2. What types of ads would be most effective
3. Any challenges in reaching this audience

Be analytical and marketing-focused."""

        elif perceiver_type == "content_feeder":
            prompt = f"""Based on this person's digital behavior analysis, provide feedback on their content algorithm profile:

Score: {score}/100  
Engagement Drivers: {', '.join(perception_data.get('engagement_drivers', []))}
Algorithm Challenges: {', '.join(perception_data.get('algorithm_challenges', []))}

Write a 2-3 sentence assessment focusing on:
1. How predictable their content preferences are
2. What content recommendation strategies would work best
3. Any algorithmic challenges in serving relevant content

Be technical and algorithm-focused."""

        elif perceiver_type == "data_broker":
            prompt = f"""Based on this person's digital behavior analysis, provide feedback on their data broker profile:

Score: {score}/100  
Profitable Traits: {', '.join(perception_data.get('profitable_traits', []))}
Data Gaps: {', '.join(perception_data.get('data_gaps', []))}

Write a 2-3 sentence assessment focusing on:
1. How valuable their data profile is for resale
2. What data points make them attractive to buyers
3. Any limitations in data collection or reliability

Be business and data-focused."""

        elif perceiver_type == "ai_system":
            prompt = f"""Based on this person's digital behavior analysis, provide feedback on their AI system profile:

Score: {score}/100  
AI Advantages: {', '.join(perception_data.get('ai_advantages', []))}
AI Limitations: {', '.join(perception_data.get('ai_limitations', []))}

Write a 2-3 sentence assessment focusing on:
1. How well AI systems can model and predict their behavior
2. What makes them easy or difficult for AI to understand
3. Any data quality or pattern recognition challenges

Be technical and AI-focused."""

        elif perceiver_type == "recruiter":
            prompt = f"""Based on this person's digital behavior analysis, provide specific feedback on how they appear to potential employers:

Score: {score}/100
Strengths: {', '.join(perception_data.get('strengths', []))}
Concerns: {', '.join(perception_data.get('concerns', []))}
Red Flags: {', '.join(perception_data.get('red_flags', []))}

Write a 2-3 sentence professional assessment focusing on:
1. What impression this person gives to recruiters
2. Specific suggestions for improving their professional online presence
3. Key strengths they should highlight more

Be constructive and actionable."""

        elif perceiver_type == "romantic_partner":
            prompt = f"""Based on this person's digital behavior analysis, provide feedback on how they appear to potential romantic partners:

Score: {score}/100  
Attractive Qualities: {', '.join(perception_data.get('attractive_qualities', []))}
Concerns: {', '.join(perception_data.get('potential_concerns', []))}
Red Flags: {', '.join(perception_data.get('red_flags', []))}

Write a 2-3 sentence assessment focusing on:
1. What dating impression this person creates online
2. How to present themselves more attractively while staying authentic
3. Any behaviors that might be deterring potential partners

Be respectful and helpful."""

        else:
            prompt = f"""Based on this person's digital behavior, provide general feedback on their online presence:

Score: {score}/100
Overall impression: {perception_data.get('overall_impression', 'neutral')}

Write 2-3 sentences about how they come across online and suggestions for improvement."""

        messages = [
            {"role": "system", "content": "You are a thoughtful digital behavior analyst who provides constructive, actionable feedback on online presence."},
            {"role": "user", "content": prompt}
        ]

        try:
            result, provider_used = await ai_manager.generate_text(messages, max_tokens=200)
            return result
        except Exception as e:
            print(f"AI feedback generation failed: {e}")
            return self._generate_fallback_feedback(perception_data, perceiver_type)

    def _generate_fallback_feedback(self, perception_data: Dict[str, Any], perceiver_type: str) -> str:
        """Generate fallback feedback when AI is unavailable."""

        if perceiver_type == "advertiser":
            score = perception_data.get("targeting_value", 50)
            if score >= 70:
                return "Your digital behavior shows strong consumer signals that are highly valuable for targeted advertising. Your diverse interests and predictable patterns make you an attractive target for marketers."
            elif score >= 50:
                return "Your online presence provides moderate value for advertisers. Consider diversifying your digital engagement to increase or decrease your advertising profile visibility."
            else:
                return "Your digital behavior patterns show strong resistance to advertising targeting. Your privacy-conscious behavior and unpredictable patterns make you a challenging audience to reach."

        elif perceiver_type == "content_feeder":
            score = perception_data.get("engagement_score", 50)
            if score >= 70:
                return "Your content consumption patterns are highly predictable, making you an ideal user for content recommendation algorithms. Your consistent preferences enable accurate content targeting."
            elif score >= 50:
                return "Your content behavior is moderately predictable for recommendation algorithms. Some patterns are clear while others present targeting challenges for content systems."
            else:
                return "Your content consumption patterns are unpredictable and challenging for recommendation algorithms. Your diverse and inconsistent preferences make content targeting difficult."

        elif perceiver_type == "data_broker":
            score = perception_data.get("data_value", 50)
            if score >= 70:
                return "Your digital profile is highly valuable to data brokers due to rich behavioral patterns and valuable demographic signals. Your data would command premium prices in data markets."
            elif score >= 50:
                return "Your digital profile has moderate value for data brokers. Some valuable signals are present but gaps limit the overall market value of your information."
            else:
                return "Your digital profile has limited value for data brokers due to privacy-conscious behavior and fragmented data patterns. Your information would be difficult to monetize."

        elif perceiver_type == "ai_system":
            score = perception_data.get("ai_confidence", 50)
            if score >= 70:
                return "AI systems can model your behavior with high confidence due to consistent patterns and rich data. Your digital footprint enables accurate predictions and classifications."
            elif score >= 50:
                return "AI systems have moderate confidence in modeling your behavior. Some patterns are clear while others present challenges for machine learning algorithms."
            else:
                return "AI systems struggle to model your behavior due to inconsistent patterns or limited data. Your digital footprint presents significant challenges for algorithmic analysis."

        elif perceiver_type == "recruiter":
            score = perception_data.get("hire_likelihood", 50)
            if score >= 70:
                return "Your professional online presence shows strong industry engagement and positive communication. Continue sharing expertise and professional insights to maintain this excellent impression."
            elif score >= 50:
                return "Your online presence is professionally acceptable but could be enhanced. Consider sharing more industry insights and reducing personal content during work hours."
            else:
                return "Your online presence may raise concerns for recruiters. Focus on professional content, avoid controversial topics, and showcase your expertise more prominently."

        elif perceiver_type == "romantic_partner":
            score = perception_data.get("compatibility_score", 50)
            if score >= 70:
                return "Your online presence suggests you're a positive, interesting person who would be an engaging partner. Your balanced interests and discrete approach to personal matters are attractive qualities."
            elif score >= 50:
                return "Your online presence is generally appealing but could be more attractive to potential partners. Consider sharing more positive content and diverse interests while maintaining authenticity."
            else:
                return "Your online behavior may not be creating the best impression for potential romantic partners. Focus on positive content, reduce controversial posts, and show your fun, creative side more."

        else:
            return "Your online presence shows authentic engagement with diverse topics. Consider your audience when posting and maintain a balance between personal expression and public perception."

    async def generate_persona_profile(self, behavior_logs: List[BehaviorLog]) -> Dict[str, Any]:
        """Generate a persona profile from behavior logs for testing purposes."""

        if not behavior_logs:
            return {
                'top_topics': [],
                'emotional_tone': {'positive': 0.33, 'neutral': 0.33, 'negative': 0.33},
                'interest_map': {},
                'bias_score': {'political_left': 0, 'political_right': 0},
                'persona_summary': 'No data available for analysis',
                'personality_traits': [],
                'data_points_count': 0
            }

        # Extract keywords and analyze topics
        all_keywords = []
        for log in behavior_logs:
            all_keywords.extend(log.keywords)

        topic_counts = self.extract_topics_from_keywords(all_keywords)
        sentiment_dist = self.analyze_sentiment_distribution(behavior_logs)
        political_dist = self.analyze_political_tilt_distribution(
            behavior_logs)
        platform_behavior = self.analyze_platform_behavior(behavior_logs)

        # Generate persona summary
        persona_summary = await self.generate_persona_summary(
            topic_counts, sentiment_dist, platform_behavior
        )

        # Extract personality traits
        personality_traits = self.extract_personality_traits(
            topic_counts, sentiment_dist, political_dist, behavior_logs
        )

        # Build interest network
        interest_map = self.build_interest_network(topic_counts)

        return {
            'top_topics': list(topic_counts.keys())[:10],
            'emotional_tone': sentiment_dist,
            'interest_map': interest_map,
            'bias_score': political_dist,
            'persona_summary': persona_summary,
            'personality_traits': personality_traits,
            'data_points_count': len(behavior_logs)
        }


# Global analyzer instance
persona_analyzer = PersonaAnalyzer()
