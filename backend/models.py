from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

# Admin User Model
class AdminUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminLogin(BaseModel):
    username: str
    password: str

# Content Models
class HeroContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    main_tagline: str
    sub_headline: str
    description: str
    cta_primary: str
    cta_secondary: str
    cta_primary_link: Optional[str] = "/get-started"
    cta_secondary_link: Optional[str] = "/how-it-works"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FounderContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    description: str
    quote: str
    image_url: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WhatIsSanjaya(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    heading: str
    description: List[str]
    highlight_text: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceItem(BaseModel):
    title: str
    description: str
    icon: str
    features: List[str]

class WhatWeOffer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    services: List[ServiceItem]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class HowItWorksStep(BaseModel):
    step_number: int
    title: str
    description: str
    icon: str
    color: str

class HowItWorks(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    steps: List[HowItWorksStep]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TrustItem(BaseModel):
    title: str
    description: str

class TrustSafety(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[TrustItem]
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContactInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    phone: str
    address: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# About Page Models
class CoreValue(BaseModel):
    title: str
    description: str
    icon: str
    color: str

class AboutContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_subtitle: str
    hero_description: str
    core_values: List[CoreValue]
    intent_for_children: str
    intent_for_parents: str
    intent_for_families: str
    what_we_are_not: List[str]
    disclaimer_text: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# FAQ Page Models
class FAQItem(BaseModel):
    question: str
    answer: str

class FAQContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_description: str
    faqs: List[FAQItem]
    cta_title: str
    cta_description: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# How It Works Page Models
class ProcessStep(BaseModel):
    step: int
    title: str
    description: str
    features: Optional[List[str]] = []
    color: str
    icon: str

class HowItWorksPageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_description: str
    steps: List[ProcessStep]
    cta_title: str
    cta_description: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Observer Landing Page Models
class ResponsibilityItem(BaseModel):
    title: str
    description: str
    icon: str

class ObserverContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_subtitle: str
    impact_title: str
    impact_description: List[str]
    impact_quote: str
    responsibilities: List[ResponsibilityItem]
    benefits: List[str]
    qualifications: List[str]
    application_steps: List[dict]
    cta_title: str
    cta_description: str
    cta_button_text: Optional[str] = "Apply Now"
    cta_button_link: Optional[str] = "/get-started"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Principal Landing Page Models
class FeatureItem(BaseModel):
    title: str
    description: str
    icon: str

class Testimonial(BaseModel):
    name: str
    school: str
    text: str

class PrincipalContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_subtitle: str
    value_prop_title: str
    value_prop_description: List[str]
    features: List[FeatureItem]
    benefits: List[str]
    testimonials: List[Testimonial]
    implementation_steps: List[dict]
    pricing_title: str
    pricing_description: str
    cta_title: str
    cta_description: str
    cta_button_text: Optional[str] = "Schedule Demo"
    cta_button_link: Optional[str] = "/get-started"
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Get Started Page Models
class GetStartedContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str
    hero_description: str
    form_title: str
    form_description: str
    success_message: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Inquiry/Contact Form Model
class InquirySubmission(BaseModel):
    parent_name: str
    email: str
    phone: str
    child_name: str
    child_age: int
    school_name: Optional[str] = ""
    message: Optional[str] = ""

class Inquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_name: str
    email: str
    phone: str
    child_name: str
    child_age: int
    school_name: str
    message: str
    status: str = "new"  # new, contacted, enrolled, closed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = ""

# Phase 1: Parent Dashboard & User Management Models
class ParentUser(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    phone: str
    hashed_password: str
    role: str = "parent"  # parent, observer, principal
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class Child(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    age: int
    date_of_birth: Optional[str] = ""
    school: Optional[str] = ""
    grade: Optional[str] = ""
    parent_ids: List[str] = []  # Multiple guardians support
    observer_id: Optional[str] = None
    enrollment_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"  # active, paused, inactive
    notes: Optional[str] = ""

class SessionNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    observer_id: str
    session_date: datetime
    duration_minutes: int = 5
    mood_rating: Optional[int] = None  # 1-5 scale
    engagement_level: Optional[str] = ""  # low, medium, high
    topics_discussed: List[str] = []
    key_observations: str
    concerns: Optional[str] = ""
    recommended_activities: List[str] = []
    parent_visible: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProgressMetric(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    metric_type: str  # emotional_regulation, confidence, communication
    score: int  # 1-10 scale
    notes: str
    recorded_by: str  # observer_id
    recorded_at: datetime = Field(default_factory=datetime.utcnow)

class Appointment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    observer_id: str
    scheduled_time: datetime
    duration_minutes: int = 5
    status: str = "scheduled"  # scheduled, completed, cancelled, missed
    reminder_sent: bool = False
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Authentication Models
class ParentLogin(BaseModel):
    email: str
    password: str

class ParentRegistration(BaseModel):
    email: str
    name: str
    phone: str
    password: str

# Phase 2: Messaging System Models
class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str  # Links messages together
    sender_id: str  # parent_id or observer_id
    sender_type: str  # "parent" or "observer"
    recipient_id: str
    recipient_type: str  # "parent" or "observer"
    child_id: str  # Context of conversation
    message_text: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str
    observer_id: str
    child_id: str
    last_message: Optional[str] = ""
    last_message_at: Optional[datetime] = None
    unread_count_parent: int = 0
    unread_count_observer: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 2: Resources & Activities Models
class Activity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    age_range: str  # "5-7", "8-10", "11-13", "14+"
    category: str  # "emotional_regulation", "communication", "confidence", "social_skills"
    duration_minutes: int
    materials_needed: List[str]
    instructions: List[str]
    tips: List[str]
    difficulty: str  # "easy", "medium", "hard"
    image_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResourceArticle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str  # "parenting_tips", "emotional_development", "communication", etc.
    excerpt: str
    content: str  # Full article text
    age_relevant: List[str] = []  # ["5-7", "8-10", etc.]
    read_time_minutes: int
    author: str
    image_url: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 2: Gamification Models
class Badge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    criteria: str  # How to earn it
    rarity: str  # "common", "rare", "epic", "legendary"

class ChildBadge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    badge_id: str
    earned_at: datetime = Field(default_factory=datetime.utcnow)
    displayed: bool = True

class ChildStreak(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    current_streak: int = 0  # Days in a row
    longest_streak: int = 0
    last_session_date: Optional[str] = None
    total_sessions: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 3: Mood Journal Models
class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    observer_id: str
    session_id: Optional[str] = None  # Link to session note if logged during session
    mood: str  # "very_happy", "happy", "neutral", "sad", "very_sad"
    mood_emoji: str  # "😊", "🙂", "😐", "😔", "😢"
    notes: Optional[str] = ""
    triggers: List[str] = []  # What affected the mood
    logged_date: str  # YYYY-MM-DD format
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 3: Goal Setting Models
class Goal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    child_id: str
    observer_id: str  # Who created the goal
    title: str
    description: str
    category: str  # "emotional", "social", "academic", "behavioral"
    target_date: Optional[str] = None  # YYYY-MM-DD
    progress: int = 0  # 0-100
    status: str = "active"  # "active", "completed", "paused", "cancelled"
    milestones: List[dict] = []  # [{"text": "...", "completed": true/false}]
    parent_notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

# Phase 3: Community Forum Models
class ForumPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str  # Anonymous to others, but tracked for moderation
    category: str  # "emotional_support", "school_issues", "activities", "general"
    title: str
    content: str
    is_anonymous: bool = True  # Always true for now
    likes_count: int = 0
    comments_count: int = 0
    is_pinned: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ForumComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    parent_id: str  # Anonymous to others
    content: str
    is_anonymous: bool = True
    likes_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ForumLike(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parent_id: str
    target_id: str  # post_id or comment_id
    target_type: str  # "post" or "comment"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 3: Group Coaching Sessions Models
class GroupSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    facilitator_name: str
    facilitator_title: str
    topic: str  # "managing_emotions", "communication_skills", "parent_wellness", etc.
    session_date: datetime
    duration_minutes: int = 60
    max_participants: int = 20
    current_participants: int = 0
    meeting_link: Optional[str] = ""
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionRegistration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    parent_id: str
    parent_name: str
    parent_email: str
    status: str = "registered"  # "registered", "attended", "cancelled", "no_show"
    registered_at: datetime = Field(default_factory=datetime.utcnow)

