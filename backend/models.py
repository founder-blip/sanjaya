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
