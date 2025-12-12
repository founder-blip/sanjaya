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
