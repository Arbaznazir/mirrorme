from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User, BehaviorLog
from schemas import BehaviorLogCreate, BehaviorLogBatch, BehaviorLog as BehaviorLogSchema
from auth import get_current_active_user, get_current_user
from ai_engine import persona_analyzer

security = HTTPBearer()

router = APIRouter(prefix="/behavior", tags=["behavior"])


@router.post("/log", response_model=BehaviorLogSchema)
def log_behavior(
    behavior_data: BehaviorLogCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log a single behavior event."""
    db_behavior = BehaviorLog(
        user_id=current_user.id,
        **behavior_data.dict()
    )
    db.add(db_behavior)
    db.commit()
    db.refresh(db_behavior)

    return db_behavior


@router.post("/log-batch", response_model=List[BehaviorLogSchema])
def log_behavior_batch(
    batch_data: BehaviorLogBatch,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log multiple behavior events in batch."""
    db_behaviors = []

    for behavior_data in batch_data.logs:
        db_behavior = BehaviorLog(
            user_id=current_user.id,
            **behavior_data.dict()
        )
        db.add(db_behavior)
        db_behaviors.append(db_behavior)

    db.commit()

    # Refresh all objects
    for db_behavior in db_behaviors:
        db.refresh(db_behavior)

    return db_behaviors


@router.get("/logs", response_model=List[BehaviorLogSchema])
def get_behavior_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's behavior logs."""
    logs = db.query(BehaviorLog).filter(
        BehaviorLog.user_id == current_user.id
    ).offset(skip).limit(limit).all()

    return logs


@router.put("/logs/{log_id}/sensitivity")
def update_log_sensitivity(
    log_id: int,
    is_sensitive: bool,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update sensitivity flag for a behavior log."""
    log = db.query(BehaviorLog).filter(
        BehaviorLog.id == log_id,
        BehaviorLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Behavior log not found")

    log.is_sensitive = is_sensitive
    db.commit()

    return {"message": "Sensitivity updated successfully"}


@router.put("/logs/{log_id}/analysis")
def update_log_analysis_inclusion(
    log_id: int,
    include_in_analysis: bool,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update whether a log should be included in analysis."""
    log = db.query(BehaviorLog).filter(
        BehaviorLog.id == log_id,
        BehaviorLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Behavior log not found")

    log.include_in_analysis = include_in_analysis
    db.commit()

    return {"message": "Analysis inclusion updated successfully"}


@router.delete("/logs/{log_id}")
def delete_behavior_log(
    log_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a behavior log."""
    log = db.query(BehaviorLog).filter(
        BehaviorLog.id == log_id,
        BehaviorLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Behavior log not found")

    db.delete(log)
    db.commit()

    return {"message": "Behavior log deleted successfully"}


@router.get("/analytics/enhanced", response_model=dict)
def get_enhanced_analytics(
    days_back: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get enhanced analytics including political tilt and platform behavior."""
    from datetime import datetime, timedelta

    # Get behavior logs from specified time period
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    behavior_logs = db.query(BehaviorLog).filter(
        BehaviorLog.user_id == current_user.id,
        BehaviorLog.timestamp >= cutoff_date,
        BehaviorLog.include_in_analysis == True
    ).all()

    if not behavior_logs:
        return {
            "political_tilt": {"neutral": 1.0},
            "platform_behavior": {},
            "sentiment_by_platform": {},
            "engagement_patterns": {},
            "data_points": 0
        }

    # Analyze political tilt distribution
    political_dist = persona_analyzer.analyze_political_tilt_distribution(
        behavior_logs)
    sentiment_dist = persona_analyzer.analyze_sentiment_distribution(
        behavior_logs)
    platform_analysis = persona_analyzer.analyze_platform_behavior(
        behavior_logs)

    # Calculate engagement patterns
    engagement_patterns = {
        "searches": len([log for log in behavior_logs if log.behavior_type == "search"]),
        "social_interactions": len([log for log in behavior_logs if log.behavior_type.startswith('tweet_')]),
        "video_consumption": len([log for log in behavior_logs if log.behavior_type.startswith('youtube_')]),
        "total_sessions": len(behavior_logs)
    }

    return {
        "political_tilt": political_dist,
        "platform_behavior": platform_analysis,
        "sentiment_distribution": sentiment_dist,
        "engagement_patterns": engagement_patterns,
        "data_points": len(behavior_logs),
        "analysis_period_days": days_back
    }


@router.post("/log-instagram", response_model=dict)
def log_instagram_data(
    instagram_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log Instagram data (prepared for future API integration)."""
    # This endpoint is prepared for when Instagram API access is available
    # For now, it can accept manually exported data or future API integration

    processed_logs = []

    if "likes" in instagram_data:
        for like in instagram_data["likes"]:
            # Process Instagram likes into behavior logs
            db_behavior = BehaviorLog(
                user_id=current_user.id,
                source="instagram_api",
                behavior_type="instagram_like",
                category="social",
                keywords=like.get("hashtags", []),
                content=like.get("caption", "")[:280],  # Limit content
                sentiment="positive",  # Likes are generally positive engagement
                author=like.get("author"),
                timestamp=like.get("timestamp")
            )
            db.add(db_behavior)
            processed_logs.append(db_behavior)

    if "story_views" in instagram_data:
        for story in instagram_data["story_views"]:
            db_behavior = BehaviorLog(
                user_id=current_user.id,
                source="instagram_api",
                behavior_type="instagram_story_view",
                category="social",
                keywords=story.get("hashtags", []),
                author=story.get("author"),
                timestamp=story.get("timestamp")
            )
            db.add(db_behavior)
            processed_logs.append(db_behavior)

    db.commit()

    return {
        "message": f"Processed {len(processed_logs)} Instagram data points",
        "logs_created": len(processed_logs)
    }


@router.get("/analytics/digital-avatars", response_model=dict)
def get_digital_avatars(
    days_back: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get digital avatars - different personality versions based on platform behavior."""
    from datetime import datetime, timedelta

    # Get behavior logs from specified time period
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    behavior_logs = db.query(BehaviorLog).filter(
        BehaviorLog.user_id == current_user.id,
        BehaviorLog.timestamp >= cutoff_date,
        BehaviorLog.include_in_analysis == True
    ).all()

    if not behavior_logs:
        return {
            "digital_avatars": [],
            "message": "No behavior data available. Start browsing with the extension to generate your digital avatars.",
            "data_points": 0
        }

    # Analyze platform behavior and generate avatars
    platform_analysis = persona_analyzer.analyze_platform_behavior(
        behavior_logs)
    digital_avatars = persona_analyzer.generate_digital_avatars(
        behavior_logs, platform_analysis)

    return {
        "digital_avatars": digital_avatars,
        "data_points": len(behavior_logs),
        "analysis_period_days": days_back,
        "total_avatars": len(digital_avatars)
    }


@router.get("/analytics/algorithm-influence", response_model=dict)
def get_algorithm_influence_analysis(
    days_back: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get algorithm influence timeline analysis showing bias trends and manipulation patterns."""
    from datetime import datetime, timedelta

    # Get behavior logs from specified time period
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    behavior_logs = db.query(BehaviorLog).filter(
        BehaviorLog.user_id == current_user.id,
        BehaviorLog.timestamp >= cutoff_date,
        BehaviorLog.include_in_analysis == True
    ).all()

    if not behavior_logs:
        return {
            "timeline_data": [],
            "political_trend": [],
            "sentiment_trend": [],
            "algorithm_influence": {
                "bias_reinforcement_detected": False,
                "political_polarization_trend": "stable",
                "sentiment_manipulation_detected": False,
                "topic_echo_chambers": [],
                "platform_bias_warnings": [],
                "recommendations": ["Collect more browsing data to detect algorithmic influence patterns"]
            },
            "analysis_period_days": days_back,
            "total_data_points": 0,
            "message": "No behavior data available for algorithm influence analysis"
        }

    # Perform algorithm influence timeline analysis
    influence_analysis = persona_analyzer.analyze_algorithm_influence_timeline(
        behavior_logs, days_back)

    return influence_analysis


@router.get("/analytics/topic-bias-detection", response_model=dict)
def get_topic_bias_analysis(
    days_back: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze what topics algorithms are pushing towards the user and detect bias patterns."""
    from datetime import datetime, timedelta

    # Get behavior logs from specified time period
    cutoff_date = datetime.utcnow() - timedelta(days=days_back)

    behavior_logs = db.query(BehaviorLog).filter(
        BehaviorLog.user_id == current_user.id,
        BehaviorLog.timestamp >= cutoff_date,
        BehaviorLog.include_in_analysis == True
    ).all()

    if not behavior_logs:
        return {
            "topic_exposure": {},
            "algorithmic_push_detected": [],
            "coordinated_topics": [],
            "platform_topic_bias": {},
            "total_interactions_analyzed": 0,
            "analysis_period_days": days_back,
            "message": "No behavior data available for topic bias analysis"
        }

    # Perform topic bias detection analysis
    bias_analysis = persona_analyzer.analyze_topic_bias_detection(
        behavior_logs, days_back)

    return bias_analysis


@router.get("/analytics/perception-analysis/{perceiver_type}")
async def get_perception_analysis(
    perceiver_type: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get perception analysis from a specific viewpoint (recruiter, romantic_partner, colleague, family_member)."""
    try:
        current_user = get_current_user(credentials, db)

        # Get behavior logs for analysis
        behavior_logs = db.query(BehaviorLog).filter(
            BehaviorLog.user_id == current_user.id
        ).order_by(BehaviorLog.timestamp.desc()).limit(1000).all()

        if not behavior_logs:
            return {
                "perceiver_type": perceiver_type,
                "overall_impression": "insufficient_data",
                "message": "Not enough data for perception analysis. Continue using the web to build your digital profile.",
                "recommendations": ["Use the browser extension to track more online behavior", "Engage with diverse content to build a richer profile"]
            }

        # Get persona profile for context
        persona_profile = await persona_analyzer.generate_persona_profile(behavior_logs)

        # Generate perception analysis
        perception_data = persona_analyzer.generate_perception_analysis(
            behavior_logs, persona_profile, perceiver_type
        )

        # Add AI-powered feedback
        ai_feedback = await persona_analyzer.generate_ai_perception_feedback(perception_data, behavior_logs)
        perception_data["ai_feedback"] = ai_feedback

        return perception_data

    except Exception as e:
        print(f"Error in perception analysis: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate perception analysis")


@router.get("/analytics/perception-comparison")
async def get_perception_comparison(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get comparison of how different types of people perceive the user."""
    try:
        current_user = get_current_user(credentials, db)

        # Get behavior logs for analysis
        behavior_logs = db.query(BehaviorLog).filter(
            BehaviorLog.user_id == current_user.id
        ).order_by(BehaviorLog.timestamp.desc()).limit(1000).all()

        if not behavior_logs:
            return {
                "message": "Not enough data for comparison analysis",
                "perceptions": {}
            }

        # Get persona profile once
        persona_profile = await persona_analyzer.generate_persona_profile(behavior_logs)

        # Generate perception analysis for different viewpoints
        perceiver_types = ["recruiter", "romantic_partner",
                           "colleague", "family_member"]
        perceptions = {}

        for perceiver_type in perceiver_types:
            perception_data = persona_analyzer.generate_perception_analysis(
                behavior_logs, persona_profile, perceiver_type
            )

            # Add AI feedback for each perspective
            ai_feedback = await persona_analyzer.generate_ai_perception_feedback(perception_data, behavior_logs)
            perception_data["ai_feedback"] = ai_feedback

            perceptions[perceiver_type] = perception_data

        # Calculate overall summary
        all_scores = []
        for perception in perceptions.values():
            score_keys = ["hire_likelihood", "compatibility_score",
                          "collaboration_score", "family_harmony_score"]
            for key in score_keys:
                if key in perception:
                    all_scores.append(perception[key])

        average_score = sum(all_scores) / len(all_scores) if all_scores else 50

        return {
            "perceptions": perceptions,
            "summary": {
                "average_perception_score": round(average_score, 1),
                "strongest_perception": max(perceptions.items(), key=lambda x: list(x[1].values())[2] if len(x[1].values()) > 2 else 50)[0],
                "most_concerning_perception": min(perceptions.items(), key=lambda x: list(x[1].values())[2] if len(x[1].values()) > 2 else 50)[0],
                "total_behavior_logs": len(behavior_logs)
            }
        }

    except Exception as e:
        print(f"Error in perception comparison: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate perception comparison")


@router.get("/analytics/perception-recommendations")
async def get_perception_recommendations(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get actionable recommendations for improving online perception across all viewpoints."""
    try:
        current_user = get_current_user(credentials, db)

        # Get behavior logs for analysis
        behavior_logs = db.query(BehaviorLog).filter(
            BehaviorLog.user_id == current_user.id
        ).order_by(BehaviorLog.timestamp.desc()).limit(1000).all()

        if not behavior_logs:
            return {
                "recommendations": [
                    "Start using the browser extension to track your online behavior",
                    "Engage with professional content to build a stronger digital presence",
                    "Diversify your online interests to appeal to different audiences"
                ],
                "priority": "data_collection"
            }

        # Get persona profile
        persona_profile = await persona_analyzer.generate_persona_profile(behavior_logs)

        # Analyze all perception types to gather comprehensive recommendations
        perceiver_types = ["recruiter", "romantic_partner",
                           "colleague", "family_member"]
        all_recommendations = set()
        concern_counts = {}

        for perceiver_type in perceiver_types:
            perception_data = persona_analyzer.generate_perception_analysis(
                behavior_logs, persona_profile, perceiver_type
            )

            # Collect recommendations
            recommendations = perception_data.get("recommendations", [])
            for rec in recommendations:
                all_recommendations.add(rec)

            # Count concerns across viewpoints
            concerns = perception_data.get("concerns", []) + perception_data.get(
                "potential_concerns", []) + perception_data.get("red_flags", [])
            for concern in concerns:
                concern_counts[concern] = concern_counts.get(concern, 0) + 1

        # Prioritize recommendations based on frequency and impact
        top_concerns = sorted(concern_counts.items(),
                              key=lambda x: x[1], reverse=True)[:3]

        # Generate personalized action plan
        action_plan = []

        # Professional improvements
        if any("professional" in rec.lower() for rec in all_recommendations):
            action_plan.append({
                "category": "professional",
                "priority": "high",
                "actions": [
                    "Share industry insights and professional achievements",
                    "Engage with thought leaders in your field",
                    "Reduce personal content during work hours"
                ]
            })

        # Communication improvements
        if any("negative" in concern for concern, _ in top_concerns):
            action_plan.append({
                "category": "communication",
                "priority": "high",
                "actions": [
                    "Balance critical posts with positive, solution-oriented content",
                    "Focus on constructive rather than negative commentary",
                    "Share uplifting content to improve overall sentiment"
                ]
            })

        # Social presence improvements
        action_plan.append({
            "category": "social_presence",
            "priority": "medium",
            "actions": [
                "Diversify your content interests to appeal to different audiences",
                "Be mindful of political content frequency",
                "Maintain authentic voice while considering your audience"
            ]
        })

        return {
            "recommendations": list(all_recommendations),
            "top_concerns": [concern for concern, count in top_concerns],
            "action_plan": action_plan,
            "analysis_summary": {
                "total_perceiver_types_analyzed": len(perceiver_types),
                "total_unique_recommendations": len(all_recommendations),
                "most_common_concern": top_concerns[0][0] if top_concerns else "No major concerns detected"
            }
        }

    except Exception as e:
        print(f"Error in perception recommendations: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate perception recommendations")
