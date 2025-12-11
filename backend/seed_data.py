"""
Seed initial content data for Sanjaya website
Run this once to populate the database with current website content
"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
from datetime import datetime

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Hero Content
    hero_content = {
        "main_tagline": "Nurturing Your Child's Emotional Voice",
        "sub_headline": "Daily Emotional Support Through Caring Conversations",
        "description": "Sanjaya connects your child with trained observers for gentle 5-minute daily check-ins, helping them express feelings and build emotional confidence.",
        "cta_primary": "Start Free Trial",
        "cta_secondary": "Watch How It Works",
        "updated_at": datetime.utcnow()
    }
    
    # Founder Content
    founder_content = {
        "name": "Smt. Punam Jaiswal",
        "title": "Founder and Former Principal",
        "description": "With years of experience in education and child psychology, Punam Ma'am, as a former principal, brings an unique blend of empathy and expertise to every interaction. Her gentle approach and profound understanding of children's needs make her the ideal guide for your child's inner growth journey.",
        "quote": "Every child has a story to tell. My role is simply to listen, understand, and help parents see the beautiful complexity of their child's world.",
        "image_url": "/images/punam-jaiswal.jpg",
        "updated_at": datetime.utcnow()
    }
    
    # What is Sanjaya
    what_is_sanjaya = {
        "heading": "What is Sanjaya – The Observer?",
        "description": [
            "Sanjaya is a specialized, non-judgmental listening support system.",
            "A confidential companion to help your child process their inner world.",
            "Not counseling, therapy, or teaching.",
            "We listen patiently and your child finds their own clarity.",
            "Every child is paired with a trained ethical observer who listens to them for 5 minutes a day and simply documents what they heard."
        ],
        "highlight_text": "Sanjaya – The Observer is India's first structured daily observation program supervised by Legendary Principals.",
        "updated_at": datetime.utcnow()
    }
    
    # Contact Info
    contact_info = {
        "email": "support@sanjaya.com",
        "phone": "+91 98765 43210",
        "address": "India",
        "updated_at": datetime.utcnow()
    }
    
    # Clear existing data and insert new
    await db.hero_content.delete_many({})
    await db.hero_content.insert_one(hero_content)
    print("✓ Hero content seeded")
    
    await db.founder_content.delete_many({})
    await db.founder_content.insert_one(founder_content)
    print("✓ Founder content seeded")
    
    await db.what_is_sanjaya.delete_many({})
    await db.what_is_sanjaya.insert_one(what_is_sanjaya)
    print("✓ What is Sanjaya content seeded")
    
    await db.contact_info.delete_many({})
    await db.contact_info.insert_one(contact_info)
    print("✓ Contact info seeded")
    
    print("\n✅ Database seeded successfully with initial content!")
    client.close()

if __name__ == "__main__":
    from dotenv import load_dotenv
    from pathlib import Path
    
    ROOT_DIR = Path(__file__).parent
    load_dotenv(ROOT_DIR / '.env')
    
    asyncio.run(seed_database())
