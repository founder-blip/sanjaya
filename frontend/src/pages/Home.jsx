import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, CheckCircle, Users, Phone, Lock, Heart, ArrowRight, Mail, MessageCircle, Star, Eye, Calendar, Award, ChevronDown, ChevronUp, FileText, TrendingUp } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [activePrivacyTab, setActivePrivacyTab] = useState('safety');
  
  // Content states
  const [heroContent, setHeroContent] = useState({
    main_tagline: 'Nurturing Your Child\'s Emotional Voice',
    sub_headline: 'Daily Emotional Support Through Caring Conversations',
    description: 'Sanjaya connects your child with trained observers for gentle 5-minute daily check-ins, helping them express feelings and build emotional confidence.',
    cta_primary: 'Start Free Trial',
    cta_secondary: 'Watch How It Works'
  });
  
  const [founderContent, setFounderContent] = useState({
    name: 'Smt. Punam Jaiswal',
    title: 'Founder and Former Principal',
    description: 'With years of experience in education and child psychology, Punam Ma\'am, as a former principal, brings an unique blend of empathy and expertise to every interaction. Her gentle approach and profound understanding of children\'s needs make her the ideal guide for your child\'s inner growth journey.',
    quote: 'Every child has a story to tell. My role is simply to listen, understand, and help parents see the beautiful complexity of their child\'s world.',
    image_url: '/images/punam-jaiswal.jpg'
  });
  
  const [whatIsSanjaya, setWhatIsSanjaya] = useState({
    heading: 'What is Sanjaya – The Observer?',
    description: [
      'Sanjaya is a specialized, non-judgmental listening support system.',
      'A confidential companion to help your child process their inner world.'
    ],
    highlight_text: 'Sanjaya – The Observer is India\'s first structured daily observation program supervised by Legendary Principals.'
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: 'support@sanjaya.com',
    phone: '+91 98765 43210',
    address: 'India'
  });

  // Offers data
  const offers = [
    {
      id: 'check-ins',
      title: 'Daily Emotional Check-Ins',
      shortDesc: 'Short, gentle 5-minute phone conversations every day',
      icon: Phone,
      color: 'orange',
      features: [
        'Consistent daily routine builds trust',
        'No pressure to share anything specific',
        'Age-appropriate conversations',
        'Trained observers who truly listen',
        'Flexible timing based on your schedule'
      ]
    },
    {
      id: 'patterns',
      title: 'Emotional Pattern Recognition',
      shortDesc: 'Our trained observers notice emotional trends and patterns',
      icon: Heart,
      color: 'blue',
      features: [
        'AI-assisted insights for accuracy',
        'Human review & validation always',
        'Long-term trend tracking',
        'Early detection of emotional shifts',
        'Personalized attention to each child'
      ]
    },
    {
      id: 'reports',
      title: 'Personalized Parent Reports',
      shortDesc: 'Receive weekly summaries with actionable insights',
      icon: Award,
      color: 'green',
      features: [
        'Easy-to-understand summaries',
        'Principal guidance included',
        'Secure & confidential delivery',
        'Actionable recommendations',
        'Track progress over time'
      ]
    },
    {
      id: 'scheduling',
      title: 'Flexible Scheduling',
      shortDesc: 'Automated scheduling adapts to your child\'s routine',
      icon: Calendar,
      color: 'purple',
      features: [
        'Smart call scheduling system',
        'Weekend support available',
        'Adjust timing anytime',
        'Reschedule with ease',
        'Holiday flexibility'
      ]
    }
  ];

  // Privacy & Safety tabs data
  const privacyTabs = {
    safety: {
      title: 'Child Safety',
      icon: Shield,
      items: [
        { title: 'Trained & Supervised Observers', desc: 'All observers undergo rigorous training and are supervised by experienced principals.' },
        { title: 'Session Recording', desc: 'All sessions are recorded per regulations for quality assurance and safety.' },
        { title: 'Background Verified Staff', desc: 'Every team member passes thorough background verification checks.' },
        { title: 'Emergency Protocols', desc: 'Clear protocols in place if any concerning patterns are detected.' }
      ]
    },
    privacy: {
      title: 'Data Privacy',
      icon: Lock,
      items: [
        { title: 'End-to-End Encryption', desc: 'All data is encrypted in transit and at rest.' },
        { title: 'You Control Your Data', desc: 'Access, download, or delete your data anytime you want.' },
        { title: 'No Data Selling', desc: 'We never sell or share your child\'s information with third parties.' },
        { title: 'GDPR Compliant', desc: 'Following international data protection standards.' }
      ]
    },
    consent: {
      title: 'Parent Consent',
      icon: FileText,
      items: [
        { title: 'Explicit Permission Required', desc: 'Nothing happens without your written consent.' },
        { title: 'Withdraw Anytime', desc: 'Cancel your enrollment whenever you want, no questions asked.' },
        { title: 'Transparent Process', desc: 'Know exactly what happens in each session.' },
        { title: 'Regular Updates', desc: 'Stay informed about your child\'s journey.' }
      ]
    }
  };
  
  // Load content from backend on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [heroRes, founderRes, sanjayaRes, contactRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/content/hero`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/founder`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/what-is-sanjaya`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/contact`).catch(() => ({ data: null }))
        ]);
        
        if (heroRes.data && Object.keys(heroRes.data).length > 0) {
          setHeroContent(prev => ({ ...prev, ...heroRes.data }));
        }
        if (founderRes.data && Object.keys(founderRes.data).length > 0) {
          setFounderContent(prev => ({ ...prev, ...founderRes.data }));
        }
        if (sanjayaRes.data && Object.keys(sanjayaRes.data).length > 0) {
          setWhatIsSanjaya(prev => ({ ...prev, ...sanjayaRes.data }));
        }
        if (contactRes.data && Object.keys(contactRes.data).length > 0) {
          setContactInfo(prev => ({ ...prev, ...contactRes.data }));
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    
    loadContent();
  }, []);

  const colorClasses = {
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                {heroContent.main_tagline}
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-3 md:mb-4 font-medium">
                {heroContent.sub_headline}
              </p>
              
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 leading-relaxed">
                {heroContent.description}
              </p>
              
              <div className="mb-6 md:mb-8">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/get-started'}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 md:px-12 py-5 md:py-7 text-base md:text-xl rounded-full shadow-xl transform hover:scale-105 transition-all cursor-pointer"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Button>
                <p className="text-gray-500 text-sm mt-3">No credit card required • 7-day free trial</p>
              </div>

              <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">A</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">B</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">C</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-bold text-gray-900">500+ Children</div>
                    <div>Supported Daily</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-bold text-gray-900">4.9/5 Rating</div>
                    <div>From Parents</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-200 to-orange-300 rounded-3xl p-8 flex items-center justify-center">
                  <span className="text-6xl">💭</span>
                </div>
                <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl p-8 flex items-center justify-center">
                  <span className="text-6xl">🎯</span>
                </div>
                <div className="bg-gradient-to-br from-purple-200 to-purple-300 rounded-3xl p-8 flex items-center justify-center">
                  <span className="text-6xl">🌱</span>
                </div>
                <div className="bg-gradient-to-br from-pink-200 to-pink-300 rounded-3xl p-8 flex items-center justify-center">
                  <span className="text-6xl">✨</span>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full opacity-60 animate-pulse delay-75"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Founder Section - Redesigned */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">Meet Our Founder</h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Founder Image with Name Below */}
            <div className="flex flex-col items-center">
              <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl ring-8 ring-orange-200 mb-6">
                <img 
                  src={founderContent.image_url} 
                  alt={founderContent.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center">{founderContent.name}</h3>
              <p className="text-orange-600 font-semibold text-lg text-center">{founderContent.title}</p>
            </div>

            {/* Quote and Description */}
            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {founderContent.description}
              </p>
              
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-6 rounded-r-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-4xl text-orange-500">"</span>
                  <div>
                    <p className="text-gray-800 italic text-lg leading-relaxed mb-2">
                      {founderContent.quote}
                    </p>
                    <p className="text-gray-700 font-semibold">— {founderContent.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Sanjaya - Eye-catching Redesign */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Eye className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">Discover</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              {whatIsSanjaya.heading}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {whatIsSanjaya.description && whatIsSanjaya.description.map((desc, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                <p className="text-xl font-medium text-white leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="flex items-center gap-4 bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-400/30">
              <span className="text-red-400 text-3xl">✕</span>
              <p className="text-lg font-medium text-white">
                Not counseling, therapy, or teaching.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
              <span className="text-green-400 text-3xl">✓</span>
              <p className="text-lg font-medium text-white">
                We listen patiently and your child finds their own clarity.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/30 text-center">
            <p className="text-2xl md:text-3xl font-bold text-yellow-200">
              {whatIsSanjaya.highlight_text}
            </p>
          </div>

          <p className="text-xl text-purple-200 text-center mt-8">
            Every child is paired with a trained ethical observer who listens to them for 5 minutes a day and simply documents what they heard.
          </p>
        </div>
      </section>

      {/* What We Offer - Expandable Cards */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            What We Offer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Comprehensive emotional support designed for children aged 5-18. Click to learn more.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {offers.map((offer) => {
              const Icon = offer.icon;
              const colors = colorClasses[offer.color];
              const isExpanded = expandedOffer === offer.id;
              
              return (
                <Card 
                  key={offer.id}
                  onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 ${colors.border} rounded-2xl hover:shadow-2xl ${isExpanded ? 'shadow-2xl ring-2 ring-offset-2 ring-' + offer.color + '-400' : 'shadow-lg'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-7 h-7 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{offer.title}</h3>
                          <p className="text-gray-600">{offer.shortDesc}</p>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${colors.bg} transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 mt-6 pt-6 border-t border-gray-200' : 'max-h-0'}`}>
                      <ul className="space-y-3">
                        {offer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/get-started';
                        }}
                        className={`mt-6 bg-gradient-to-r ${colors.gradient} text-white rounded-full`}
                      >
                        Get Started <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal Flow */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            How Sanjaya Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-16">
            From enrollment to insights, here's the complete journey
          </p>

          {/* Horizontal Flow - Desktop */}
          <div className="hidden lg:block relative">
            {/* Connecting line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-purple-400 to-green-400"></div>
            
            <div className="grid grid-cols-6 gap-4">
              {[
                { step: 1, title: 'Sign Up', icon: '📝', circleBg: 'bg-orange-500', cardBg: 'bg-orange-50' },
                { step: 2, title: 'Get Matched', icon: '👥', circleBg: 'bg-blue-500', cardBg: 'bg-blue-50' },
                { step: 3, title: 'Daily Check-In', icon: '📞', circleBg: 'bg-purple-500', cardBg: 'bg-purple-50' },
                { step: 4, title: 'Patterns Noted', icon: '🧠', circleBg: 'bg-pink-500', cardBg: 'bg-pink-50' },
                { step: 5, title: 'Reports Ready', icon: '📊', circleBg: 'bg-green-500', cardBg: 'bg-green-50' },
                { step: 6, title: 'Child Thrives', icon: '🌟', circleBg: 'bg-teal-500', cardBg: 'bg-teal-50' }
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 ${item.circleBg} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-10 mb-4`}>
                    {item.step}
                  </div>
                  <div className={`${item.cardBg} rounded-2xl p-4 text-center w-full`}>
                    <span className="text-3xl mb-2 block">{item.icon}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Flow - Mobile/Tablet */}
          <div className="lg:hidden space-y-6">
            {[
              { step: 1, title: 'Sign Up & Enroll', desc: 'Create your account and provide consent', icon: '📝', color: 'bg-orange-100 border-orange-200' },
              { step: 2, title: 'Get Matched', desc: 'Child paired with trained observer', icon: '👥', color: 'bg-blue-100 border-blue-200' },
              { step: 3, title: 'Daily Check-In', desc: '5-minute conversations daily', icon: '📞', color: 'bg-purple-100 border-purple-200' },
              { step: 4, title: 'Patterns Identified', desc: 'AI assists in recognizing trends', icon: '🧠', color: 'bg-pink-100 border-pink-200' },
              { step: 5, title: 'Reports Generated', desc: 'Principals prepare summaries', icon: '📊', color: 'bg-green-100 border-green-200' },
              { step: 6, title: 'Child Thrives', desc: 'Increased confidence & awareness', icon: '🌟', color: 'bg-teal-100 border-teal-200' }
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                    {item.step}
                  </div>
                  {idx < 5 && <div className="w-0.5 h-8 bg-gray-300 my-2"></div>}
                </div>
                <div className={`flex-1 ${item.color} border-2 rounded-xl p-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Privacy - Tabbed Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Safety & Privacy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your child's safety and your family's privacy are our top priorities
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {Object.entries(privacyTabs).map(([key, tab]) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActivePrivacyTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    activePrivacyTab === key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-green-100'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.title}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {privacyTabs[activePrivacyTab].items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition-colors">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
              Join hundreds of families who trust Sanjaya to support their children's emotional growth
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/get-started'}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-7 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => window.location.href = '/contact'}
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-12 py-7 text-xl rounded-full shadow-lg"
              >
                <Phone className="mr-2" />
                Schedule a Call
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-orange-200 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-xl">Email Us</h4>
                <p className="text-gray-600 mb-2">{contactInfo.email}</p>
                <p className="text-gray-500 text-sm">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-xl">Call Us</h4>
                <p className="text-gray-600 mb-2">{contactInfo.phone}</p>
                <p className="text-gray-500 text-sm">Mon-Fri, 9 AM - 6 PM IST</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-xl">Live Chat</h4>
                <p className="text-gray-600 mb-2">Instant support</p>
                <p className="text-gray-500 text-sm">Click the chat icon</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all z-50 animate-bounce"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;
