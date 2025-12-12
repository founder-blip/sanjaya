"""
Seed script to populate all page content in the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_all_content():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Starting database seeding...")
    
    # About Page Content
    about_content = {
        'hero_title': 'Why Sanjaya Exists',
        'hero_subtitle': 'Every child deserves to be heard. Every parent deserves to understand their child better.',
        'hero_description': 'We created Sanjaya to give children a safe space to express themselves and help parents nurture their emotional growth.',
        'core_values': [
            {
                'title': 'Care First',
                'description': 'We approach every child with empathy and warmth. No judgment. No pressure. Just genuine care for their wellbeing.',
                'icon': 'Heart',
                'color': 'blue'
            },
            {
                'title': 'Responsibility',
                'description': 'We handle every interaction with care. Sessions are recorded per regulations. Parents are informed. Safety is paramount.',
                'icon': 'Shield',
                'color': 'green'
            },
            {
                'title': 'Partnership with Parents',
                'description': 'We work alongside parents, not instead of them. Our insights help you guide your child\'s emotional journey.',
                'icon': 'Users',
                'color': 'purple'
            },
            {
                'title': 'Gentle Support',
                'description': 'This is not therapy or counseling. It\'s gentle emotional support to help children feel valued and heard.',
                'icon': 'Smile',
                'color': 'orange'
            }
        ],
        'intent_for_children': 'We want to create a space where you can share your thoughts and feelings freely, knowing someone is truly listening.',
        'intent_for_parents': 'We want to help you understand your child\'s emotional world better, so you can support them in meaningful ways.',
        'intent_for_families': 'We believe stronger emotional connections make happier families.',
        'what_we_are_not': [
            'Not a replacement for therapy or professional mental health care',
            'Not a diagnostic service',
            'Not a crisis intervention service',
            'Not medical or clinical treatment'
        ],
        'disclaimer_text': 'If your child needs professional help, we encourage you to seek appropriate clinical support. Sanjaya complements, but does not replace, professional care.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.about_content.delete_many({})
    await db.about_content.insert_one(about_content)
    print("✅ About page content seeded")
    
    # FAQ Page Content
    faq_content = {
        'hero_title': 'Frequently Asked Questions',
        'hero_description': 'Clear answers to common questions about Sanjaya.',
        'faqs': [
            {
                'question': 'Is this therapy or counseling?',
                'answer': 'No. Sanjaya is not therapy, counseling, or clinical treatment. We provide gentle emotional support through daily check-ins. Observers are trained listeners, not therapists. If your child needs professional mental health care, please consult a licensed professional.'
            },
            {
                'question': 'Is data recorded?',
                'answer': 'Yes. All sessions are recorded and stored securely per regulatory requirements. This ensures safety, accountability, and quality. Recordings are encrypted and accessible only to authorized personnel. They help principals supervise observers and identify patterns for parent reports.'
            },
            {
                'question': 'How are parents informed?',
                'answer': 'Parents receive regular summaries about their child\'s emotional patterns. These reports are reviewed by principals and focus on overall wellbeing trends, not word-for-word transcripts. You\'ll get easy-to-read insights delivered securely through our system.'
            },
            {
                'question': 'Who has access to my child\'s data?',
                'answer': 'Only authorized personnel have access: the assigned observer, supervising principal, and you (the parent). Data is encrypted, stored securely, and never shared with third parties without your explicit consent. Your child\'s privacy is paramount.'
            },
            {
                'question': 'Can I withdraw my child from the program?',
                'answer': 'Absolutely. You can withdraw consent and stop the program at any time, no questions asked. Your participation is completely voluntary.'
            },
            {
                'question': 'What if my child doesn\'t want to talk?',
                'answer': 'That\'s perfectly fine. There\'s no pressure. Children can share as much or as little as they\'re comfortable with. Some days they might talk a lot, other days very little. Observers are trained to be patient and supportive.'
            },
            {
                'question': 'What age group is Sanjaya for?',
                'answer': 'Sanjaya is designed for school-going children ages 5-18. The approach is gentle and age-appropriate, adapting to each child\'s developmental stage.'
            },
            {
                'question': 'How long is each check-in?',
                'answer': 'Just 5 minutes. We keep it brief to fit naturally into a child\'s day without feeling overwhelming or intrusive.'
            },
            {
                'question': 'What happens in an emergency?',
                'answer': 'Sanjaya is not a crisis intervention service. If an observer notices signs of immediate risk or harm, parents and appropriate authorities are notified immediately according to safety protocols.'
            },
            {
                'question': 'How does AI work in Sanjaya?',
                'answer': 'AI helps identify emotional patterns from structured data over time. It never talks to children, never makes decisions, and never replaces human judgment. Think of it as a helpful tool for spotting trends that humans might miss.'
            },
            {
                'question': 'Do observers diagnose conditions?',
                'answer': 'No. Observers are not medical professionals. They don\'t diagnose, prescribe treatment, or provide clinical advice. They simply listen and note patterns to help parents understand their child\'s emotional world.'
            },
            {
                'question': 'Is parent consent required?',
                'answer': 'Yes, absolutely. Your explicit consent is mandatory before your child can participate. We take parental authority and family privacy very seriously.'
            },
            {
                'question': 'Can I see the recordings?',
                'answer': 'Access to recordings is governed by our privacy policy and regulations. Generally, parents receive summaries rather than raw recordings to protect the child\'s sense of safety and confidentiality. Special requests can be discussed with principals.'
            },
            {
                'question': 'What if I have concerns about my child\'s observer?',
                'answer': 'Please reach out immediately. All observers are supervised by principals. If you have any concerns, we\'ll address them promptly and can reassign a different observer if needed.'
            },
            {
                'question': 'How much does Sanjaya cost?',
                'answer': 'Pricing varies by school and implementation. Please contact us or speak with your school principal for specific information about enrollment in your child\'s school.'
            }
        ],
        'cta_title': 'Still Have Questions?',
        'cta_description': 'We\'re here to help. Reach out anytime.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.faq_content.delete_many({})
    await db.faq_content.insert_one(faq_content)
    print("✅ FAQ page content seeded")
    
    # How It Works Page Content
    how_it_works_page_content = {
        'hero_title': 'How Sanjaya Works',
        'hero_description': 'A simple, gentle process designed around your child\'s comfort and your peace of mind.',
        'steps': [
            {
                'step': 1,
                'title': 'Parent Enrolls Child',
                'description': 'You provide consent and basic details about your child. Your consent is mandatory and can be withdrawn anytime.',
                'features': [],
                'color': 'blue',
                'icon': 'CheckCircle'
            },
            {
                'step': 2,
                'title': 'Child Gets Matched with Observer',
                'description': 'A trained observer is assigned to your child. All observers are supervised by experienced principals.',
                'features': [],
                'color': 'green',
                'icon': 'Users'
            },
            {
                'step': 3,
                'title': 'Daily 5-Minute Check-In',
                'description': 'The observer calls your child for a gentle, 5-minute conversation. Children share whatever they\'re comfortable with.',
                'features': [
                    'No pressure to share anything specific',
                    'Observer listens without judgment',
                    'Sessions are recorded per regulations'
                ],
                'color': 'purple',
                'icon': 'Phone'
            },
            {
                'step': 4,
                'title': 'Observer Notes Patterns',
                'description': 'The observer notices emotional patterns over time. Not specific words, but overall mood and wellbeing trends.',
                'features': [],
                'color': 'orange',
                'icon': 'Heart'
            },
            {
                'step': 5,
                'title': 'AI Assists with Pattern Recognition',
                'description': 'AI helps identify trends from structured data. It never talks to children or makes decisions. Humans remain in control.',
                'features': [],
                'color': 'pink',
                'icon': 'TrendingUp'
            },
            {
                'step': 6,
                'title': 'Parents Receive Insights',
                'description': 'You receive thoughtful summaries about your child\'s emotional patterns. No raw transcripts, just helpful insights.',
                'features': [
                    'Easy-to-read summaries',
                    'Guidance from principals',
                    'Delivered securely and privately'
                ],
                'color': 'indigo',
                'icon': 'FileText'
            }
        ],
        'cta_title': 'Ready to Get Started?',
        'cta_description': 'Give your child the gift of being heard.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.how_it_works_page_content.delete_many({})
    await db.how_it_works_page_content.insert_one(how_it_works_page_content)
    print("✅ How It Works page content seeded")
    
    # Observer Landing Page Content
    observer_content = {
        'hero_title': 'Become an Observer',
        'hero_subtitle': 'Transform lives by simply listening. Make a difference in children\'s lives every single day.',
        'impact_title': 'Your Role, Your Impact',
        'impact_description': [
            'As an Observer at Sanjaya, you\'re not just a listener – you\'re a catalyst for change. Your daily 5-minute interactions create safe spaces where children can express themselves freely, building confidence and emotional intelligence.',
            'Every conversation you have helps shape a child\'s future, making them more confident, expressive, and emotionally aware.'
        ],
        'impact_quote': 'Being an Observer has been the most rewarding experience of my career. Watching children open up and grow is priceless.',
        'responsibilities': [
            {'title': 'Listen with Empathy', 'description': 'Create a safe space where children feel comfortable sharing their thoughts and feelings.', 'icon': 'Heart'},
            {'title': 'Dedicate 5 Minutes Daily', 'description': 'Commit to consistent daily interactions with each child assigned to you.', 'icon': 'Clock'},
            {'title': 'Document Observations', 'description': 'Note important cues, patterns, and developmental progress in your reports.', 'icon': 'BookOpen'},
            {'title': 'Celebrate Progress', 'description': 'Recognize and encourage every small win in a child\'s journey.', 'icon': 'Award'},
            {'title': 'Track Development', 'description': 'Monitor soft skill growth and emotional development over time.', 'icon': 'TrendingUp'},
            {'title': 'Maintain Confidentiality', 'description': 'Ensure all conversations remain private and secure.', 'icon': 'CheckCircle'}
        ],
        'benefits': [
            'Comprehensive training program',
            'Flexible working hours',
            'Make a meaningful impact',
            'Work with expert principals',
            'Continuous professional development',
            'Competitive compensation'
        ],
        'qualifications': [
            'Background in education, psychology, or child development',
            'Excellent listening and communication skills',
            'Patience and empathy towards children',
            'Commitment to confidentiality and ethics',
            'Available for 1-2 hours daily',
            'Fluent in English/Hindi'
        ],
        'application_steps': [
            {'step': 1, 'title': 'Submit Application', 'description': 'Fill out our comprehensive application form with your background and motivation.'},
            {'step': 2, 'title': 'Initial Screening', 'description': 'Our team reviews your application and credentials.'},
            {'step': 3, 'title': 'Interview', 'description': 'Meet with our principals to discuss your role and expectations.'},
            {'step': 4, 'title': 'Training Program', 'description': 'Complete our comprehensive training on child psychology and observation techniques.'},
            {'step': 5, 'title': 'Start Making Impact', 'description': 'Begin your journey as an Observer and transform lives.'}
        ],
        'cta_title': 'Ready to Make a Difference?',
        'cta_description': 'Join our team of compassionate observers and help shape the future of children\'s emotional development.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.observer_content.delete_many({})
    await db.observer_content.insert_one(observer_content)
    print("✅ Observer page content seeded")
    
    # Principal Landing Page Content
    principal_content = {
        'hero_title': 'Empower Your Institution',
        'hero_subtitle': 'Transform student outcomes with AI-powered observation and insights.',
        'value_prop_title': 'Why Leading Schools Choose Sanjaya',
        'value_prop_description': [
            'In today\'s competitive educational landscape, institutions need more than academic excellence. Parents are looking for schools that truly understand and nurture their children\'s emotional and social development.',
            'Sanjaya provides you with the tools, insights, and support to deliver exceptional holistic care – creating measurable improvements in student confidence, communication skills, and emotional intelligence.'
        ],
        'features': [
            {'title': 'Manage Your Observer Team', 'description': 'Nominate, train, and oversee observers with comprehensive management tools.', 'icon': 'Users'},
            {'title': 'AI-Powered Analytics', 'description': 'Access detailed insights and patterns identified by our advanced AI system.', 'icon': 'BarChart3'},
            {'title': 'Ensure Quality & Privacy', 'description': 'Monitor program quality while maintaining strict confidentiality standards.', 'icon': 'Shield'},
            {'title': 'Real-Time Dashboards', 'description': 'Track progress, trends, and outcomes across all children in real-time.', 'icon': 'Zap'},
            {'title': 'Guide Parents Effectively', 'description': 'Provide parents with actionable insights based on comprehensive data.', 'icon': 'Target'},
            {'title': 'Measure Impact', 'description': 'Demonstrate tangible improvements in children\'s soft skills and confidence.', 'icon': 'Award'}
        ],
        'benefits': [
            'Enhance your institution\'s value proposition',
            'Differentiate from competitors',
            'Improve student outcomes measurably',
            'Strengthen parent relationships',
            'Access cutting-edge AI technology',
            'Comprehensive training and support',
            'Flexible implementation model',
            'Proven success metrics'
        ],
        'testimonials': [
            {
                'name': 'Dr. Sharma',
                'school': 'Greenwood International School',
                'text': 'Implementing Sanjaya has transformed how we understand and support our students. Parents are more engaged, and we\'ve seen remarkable improvements in student confidence.'
            },
            {
                'name': 'Mrs. Kapoor',
                'school': 'Bright Future Academy',
                'text': 'The AI-powered insights help us identify issues early and provide targeted support. It\'s been a game-changer for our institution.'
            }
        ],
        'implementation_steps': [
            {'step': 1, 'title': 'Partnership Setup', 'description': 'We work with you to customize the program for your institution\'s unique needs and culture.'},
            {'step': 2, 'title': 'Observer Selection & Training', 'description': 'Nominate your team members and we\'ll provide comprehensive training on our methodology.'},
            {'step': 3, 'title': 'Parent Communication', 'description': 'We help you communicate the program\'s value to parents and get their enrollment.'},
            {'step': 4, 'title': 'Program Launch', 'description': 'Observers begin daily interactions with students, with full platform access for monitoring.'},
            {'step': 5, 'title': 'Continuous Insights', 'description': 'Review AI-generated analytics, guide parents, and demonstrate measurable impact.'}
        ],
        'pricing_title': 'Flexible Pricing Models',
        'pricing_description': 'We offer customized pricing based on your institution\'s size and needs. Our model scales with you – from pilot programs to full institution rollouts.',
        'cta_title': 'Ready to Transform Your Institution?',
        'cta_description': 'Join leading schools in providing exceptional holistic care for your students.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.principal_content.delete_many({})
    await db.principal_content.insert_one(principal_content)
    print("✅ Principal page content seeded")
    
    # Get Started Page Content
    get_started_content = {
        'hero_title': 'Get Started with Sanjaya',
        'hero_description': 'Begin your journey towards better emotional support for your child.',
        'form_title': 'Request Information',
        'form_description': 'Fill out the form below and we\'ll get back to you within 24 hours.',
        'success_message': 'Thank you for your interest! We\'ll contact you soon.',
        'updated_at': datetime.now(timezone.utc)
    }
    
    await db.get_started_content.delete_many({})
    await db.get_started_content.insert_one(get_started_content)
    print("✅ Get Started page content seeded")
    
    print("\n🎉 All page content seeded successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_all_content())
