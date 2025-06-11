from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User, PersonaProfile
from schemas import (
    PersonaProfile as PersonaProfileSchema,
    PersonaProfileUpdate,
    PersonaAnalysisRequest,
    PersonaAnalysisResponse
)
from auth import get_current_active_user
from ai_engine import persona_analyzer
from datetime import datetime

router = APIRouter(prefix="/persona", tags=["persona"])


@router.get("/profile", response_model=PersonaProfileSchema)
def get_persona_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user's current persona profile."""
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if not profile:
        # Create empty profile if none exists
        profile = PersonaProfile(
            user_id=current_user.id,
            top_topics=[],
            emotional_tone={},
            interest_map={},
            bias_score={},
            personality_traits=[]
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile


@router.post("/analyze", response_model=PersonaAnalysisResponse)
async def analyze_persona(
    analysis_request: PersonaAnalysisRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Perform AI analysis of user's behavior to generate persona insights."""

    # Run AI analysis
    analysis_result = await persona_analyzer.analyze_user_persona(
        db=db,
        user_id=current_user.id,
        days_back=analysis_request.days_back,
        include_sensitive=analysis_request.include_sensitive
    )

    # Update or create persona profile
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = PersonaProfile(user_id=current_user.id)
        db.add(profile)

    # Update profile with analysis results
    profile.top_topics = analysis_result["top_topics"]
    profile.emotional_tone = analysis_result["emotional_tone"]
    profile.interest_map = analysis_result["interest_map"]
    profile.persona_summary = analysis_result["persona_summary"]
    profile.personality_traits = analysis_result["personality_traits"]
    profile.last_analysis = datetime.utcnow()
    profile.data_points_count = analysis_result["data_points_analyzed"]

    db.commit()
    db.refresh(profile)

    return PersonaAnalysisResponse(
        persona_summary=analysis_result["persona_summary"],
        top_topics=analysis_result["top_topics"],
        personality_traits=analysis_result["personality_traits"],
        emotional_tone=analysis_result["emotional_tone"],
        insights=analysis_result["insights"],
        data_points_analyzed=analysis_result["data_points_analyzed"]
    )


@router.put("/profile", response_model=PersonaProfileSchema)
def update_persona_profile(
    profile_update: PersonaProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user's persona profile manually."""
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404, detail="Persona profile not found")

    # Update only provided fields
    update_data = profile_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.get("/insights")
def get_persona_insights(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get quick persona insights without full analysis."""
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if not profile or not profile.persona_summary:
        return {
            "message": "No persona data available. Run analysis first.",
            "has_data": False
        }

    return {
        "persona_summary": profile.persona_summary,
        "top_topics": profile.top_topics[:5],
        "personality_traits": profile.personality_traits,
        "last_analysis": profile.last_analysis,
        "data_points_count": profile.data_points_count,
        "has_data": True
    }


@router.delete("/profile")
def delete_persona_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete user's persona profile."""
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if profile:
        db.delete(profile)
        db.commit()

    return {"message": "Persona profile deleted successfully"}


@router.get("/export")
def export_persona_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Export user's persona data as JSON."""
    profile = db.query(PersonaProfile).filter(
        PersonaProfile.user_id == current_user.id
    ).first()

    if not profile:
        return {"message": "No persona data to export"}

    export_data = {
        "user_email": current_user.email,
        "export_timestamp": datetime.utcnow().isoformat(),
        "persona_profile": {
            "top_topics": profile.top_topics,
            "emotional_tone": profile.emotional_tone,
            "interest_map": profile.interest_map,
            "bias_score": profile.bias_score,
            "persona_summary": profile.persona_summary,
            "personality_traits": profile.personality_traits,
            "last_analysis": profile.last_analysis.isoformat() if profile.last_analysis else None,
            "data_points_count": profile.data_points_count
        }
    }

    return export_data
