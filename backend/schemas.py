from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token schemas


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None

# Persona schemas


class PersonaProfileBase(BaseModel):
    top_topics: List[str] = []
    emotional_tone: Dict[str, float] = {}
    interest_map: Dict[str, Any] = {}
    bias_score: Dict[str, Any] = {}
    personality_traits: List[str] = []


class PersonaProfileCreate(PersonaProfileBase):
    pass


class PersonaProfileUpdate(BaseModel):
    top_topics: Optional[List[str]] = None
    emotional_tone: Optional[Dict[str, float]] = None
    interest_map: Optional[Dict[str, Any]] = None
    bias_score: Optional[Dict[str, Any]] = None
    persona_summary: Optional[str] = None
    personality_traits: Optional[List[str]] = None


class PersonaProfile(PersonaProfileBase):
    id: int
    user_id: int
    persona_summary: Optional[str] = None
    last_analysis: Optional[datetime] = None
    data_points_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Behavior log schemas


class BehaviorLogBase(BaseModel):
    source: str  # "extension" or "mobile_app"
    device_id: Optional[str] = None
    # "search", "visit", "tweet_view", "youtube_video_watch", etc.
    behavior_type: str
    category: Optional[str] = None
    keywords: List[str] = []

    # Enhanced content analysis
    content: Optional[str] = None  # Limited content for analysis
    sentiment: Optional[str] = None  # "positive", "neutral", "negative"
    political_tilt: Optional[str] = None  # "left", "right", "neutral"
    confidence: Optional[float] = None  # Confidence score for analysis

    # Platform-specific metadata
    author: Optional[str] = None  # Tweet author, channel name, etc.
    video_id: Optional[str] = None  # YouTube video ID
    channel: Optional[str] = None  # YouTube channel name

    session_duration: Optional[int] = None


class BehaviorLogCreate(BehaviorLogBase):
    pass


class BehaviorLogBatch(BaseModel):
    logs: List[BehaviorLogCreate]


class BehaviorLog(BehaviorLogBase):
    id: int
    user_id: int
    timestamp: datetime
    is_sensitive: bool
    include_in_analysis: bool

    class Config:
        from_attributes = True

# Analysis schemas


class PersonaAnalysisRequest(BaseModel):
    include_sensitive: bool = False
    days_back: int = 30


class PersonaAnalysisResponse(BaseModel):
    persona_summary: str
    top_topics: List[str]
    personality_traits: List[str]
    emotional_tone: Dict[str, float]
    insights: List[str]
    data_points_analyzed: int

# Export schemas


class DataExportRequest(BaseModel):
    export_type: str  # "full", "persona_only", "metadata_only"
    include_sensitive: bool = False


class DataExportResponse(BaseModel):
    export_id: int
    download_url: str
    expires_at: datetime
