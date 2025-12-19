import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, CheckCircle, Users, Phone, Lock, Heart, ArrowRight, Mail, MessageCircle, Star, Eye, Calendar, Award, ChevronDown, FileText, TrendingUp, Sparkles, Play } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [activePrivacyTab, setActivePrivacyTab] = useState('safety');
  
  const [heroContent, setHeroContent] = useState({
    main_tagline: 'Nurturing Your Child\'s Emotional Voice',
    sub_headline: 'Daily Emotional Support Through Caring Conversations',
    description: 'Sanjaya connects your child with trained observers for gentle 5-minute daily check-ins, helping them express feelings and build emotional confidence.'
  });
  
  const [founderContent, setFounderContent] = useState({
    name: 'Smt. Punam Jaiswal',
    title: 'Founder & Former Principal',
    description: 'With years of experience in education and child psychology, Punam Ma\'am brings a unique blend of empathy and expertise to every interaction.',
    quote: 'Every child has a story to tell. My role is simply to listen, understand, and help parents see the beautiful complexity of their child\'s world.',
    image_url: '/images/punam-jaiswal.jpg'
  });
  
  const [whatIsSanjaya, setWhatIsSanjaya] = useState({
    heading: 'What is Sanjaya – The Observer?',
    description: [
      'A specialized, non-judgmental listening support system.',
      'A confidential companion to help your child process their inner world.'
    ],
    highlight_text: 'India\'s first structured daily observation program supervised by Legendary Principals.'
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: 'support@sanjaya.com',
    phone: '+91 98765 43210'
  });

  const offers = [
    { id: 'check-ins', title: 'Daily Check-Ins', shortDesc: 'Gentle 5-minute conversations every day', icon: Phone, color: 'orange',
      features: ['Consistent daily routine', 'No pressure to share', 'Age-appropriate conversations', 'Trained observers'] },
    { id: 'patterns', title: 'Pattern Recognition', shortDesc: 'We notice emotional trends & patterns', icon: Heart, color: 'rose',
      features: ['AI-assisted insights', 'Human validation always', 'Long-term tracking', 'Early detection'] },
    { id: 'reports', title: 'Parent Reports', shortDesc: 'Weekly summaries with actionable insights', icon: Award, color: 'violet',
      features: ['Easy-to-understand', 'Principal guidance', 'Secure delivery', 'Progress tracking'] },
    { id: 'scheduling', title: 'Flexible Scheduling', shortDesc: 'Adapts to your child\'s routine', icon: Calendar, color: 'emerald',
      features: ['Smart scheduling', 'Weekend support', 'Easy rescheduling', 'Holiday flexibility'] }
  ];

  const privacyTabs = {
    safety: { title: 'Child Safety', icon: Shield,
      items: [
        { title: 'Trained Observers', desc: 'Rigorous training & principal supervision' },
        { title: 'Session Recording', desc: 'All sessions recorded for quality assurance' },
        { title: 'Background Verified', desc: 'Thorough background checks for all staff' },
        { title: 'Emergency Protocols', desc: 'Clear protocols for any concerns' }
      ]},
    privacy: { title: 'Data Privacy', icon: Lock,
      items: [
        { title: 'Encrypted Data', desc: 'End-to-end encryption for all data' },
        { title: 'Your Control', desc: 'Access, download, or delete anytime' },
        { title: 'No Data Selling', desc: 'We never sell your information' },
        { title: 'GDPR Compliant', desc: 'International data protection standards' }
      ]},
    consent: { title: 'Parent Consent', icon: FileText,
      items: [
        { title: 'Explicit Permission', desc: 'Nothing happens without your consent' },
        { title: 'Withdraw Anytime', desc: 'Cancel enrollment whenever you want' },
        { title: 'Transparent Process', desc: 'Know exactly what happens' },
        { title: 'Regular Updates', desc: 'Stay informed about progress' }
      ]}
  };
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [heroRes, founderRes, sanjayaRes, contactRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/content/hero`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/founder`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/what-is-sanjaya`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/contact`).catch(() => ({ data: null }))
        ]);
        if (heroRes.data && Object.keys(heroRes.data).length > 0) setHeroContent(prev => ({ ...prev, ...heroRes.data }));
        if (founderRes.data && Object.keys(founderRes.data).length > 0) setFounderContent(prev => ({ ...prev, ...founderRes.data }));
        if (sanjayaRes.data && Object.keys(sanjayaRes.data).length > 0) setWhatIsSanjaya(prev => ({ ...prev, ...sanjayaRes.data }));
        if (contactRes.data && Object.keys(contactRes.data).length > 0) setContactInfo(prev => ({ ...prev, ...contactRes.data }));
      } catch (error) { console.error('Error loading content:', error); }
    };
    loadContent();
  }, []);

  const colorMap = {
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', iconBg: 'bg-orange-100' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', iconBg: 'bg-rose-100' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', iconBg: 'bg-violet-100' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', iconBg: 'bg-emerald-100' }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Navigation />
      
      {/* Hero Section - Premium Child-Centric Design */}
      <section className="relative pt-24 md:pt-28 pb-16 md:pb-24 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"></div>
        
        {/* Floating Blobs */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-yellow-200 to-orange-200 blob-morph blur-3xl opacity-40 animate-drift"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-rose-200 to-pink-200 blob-morph blur-3xl opacity-30 animate-drift delay-1000"></div>
        <div className="absolute top-40 left-1/4 w-20 h-20 bg-gradient-to-br from-violet-300 to-purple-300 blob animate-float-rotate delay-500"></div>
        <div className="absolute top-60 right-1/4 w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-300 blob-alt animate-float-gentle delay-300"></div>
        <div className="absolute bottom-32 right-20 w-12 h-12 bg-gradient-to-br from-pink-300 to-rose-300 blob-organic animate-wiggle-slow delay-700"></div>
        <div className="absolute top-32 left-20 w-14 h-14 bg-gradient-to-br from-cyan-200 to-blue-200 blob-soft animate-bob delay-200"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm border border-orange-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-gray-700 font-friendly">Trusted by 500+ families across India</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                <span className="text-gradient-warm">Nurturing</span> Your Child's
                <br />
                <span className="relative">
                  Emotional Voice
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 4C200 6 250 8 298 3" stroke="#f97316" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-4 font-friendly font-medium">
                {heroContent.sub_headline}
              </p>
              
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {heroContent.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = '/get-started'}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-300 font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.location.href = '/process'}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg rounded-2xl font-semibold"
                >
                  <Play className="mr-2 w-5 h-5" />
                  See How It Works
                </Button>
              </div>
              
              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {['🧒', '👧', '👦'].map((emoji, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-white shadow-md border-2 border-white flex items-center justify-center text-xl">{emoji}</div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">500+</div>
                    <div className="text-xs text-gray-500">Happy Kids</div>
                  </div>
                </div>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">4.9</div>
                    <div className="text-xs text-gray-500">Parent Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Illustration Grid */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { emoji: '💭', color: 'from-orange-100 to-amber-100', label: 'Express', anim: 'animate-float' },
                  { emoji: '🎯', color: 'from-blue-100 to-cyan-100', label: 'Focus', anim: 'animate-float-gentle' },
                  { emoji: '🌱', color: 'from-emerald-100 to-green-100', label: 'Grow', anim: 'animate-float-slow' },
                  { emoji: '✨', color: 'from-violet-100 to-purple-100', label: 'Shine', anim: 'animate-wiggle-slow' }
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.color} rounded-3xl p-8 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-default animate-float-gentle`} style={{animationDelay: `${i * 0.3}s`}}>
                    <span className={`text-5xl ${item.anim}`} style={{animationDelay: `${i * 0.2}s`}}>{item.emoji}</span>
                    <span className="text-sm font-semibold text-gray-600 font-friendly">{item.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Floating blob elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-yellow-300 to-amber-400 blob-morph opacity-80 animate-drift shadow-lg"></div>
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-br from-rose-300 to-pink-400 blob-morph opacity-70 animate-drift delay-1500 shadow-lg"></div>
              <div className="absolute top-1/2 -right-12 w-10 h-10 bg-gradient-to-br from-cyan-300 to-blue-400 blob-organic opacity-60 animate-float-rotate delay-700"></div>
              <div className="absolute -top-4 left-1/3 w-8 h-8 bg-gradient-to-br from-emerald-300 to-green-400 blob-soft opacity-70 animate-bob delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-orange-50/30 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16">
            Meet the <span className="text-gradient-warm">Heart</span> Behind Sanjaya
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden shadow-2xl ring-8 ring-orange-100">
                  <img src={founderContent.image_url} alt={founderContent.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="mt-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900">{founderContent.name}</h3>
                <p className="text-orange-600 font-semibold font-friendly">{founderContent.title}</p>
              </div>
            </div>

            <div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">{founderContent.description}</p>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-400 p-6 rounded-r-2xl">
                <p className="text-gray-700 italic text-lg leading-relaxed mb-2">"{founderContent.quote}"</p>
                <p className="text-gray-600 font-semibold">— {founderContent.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Sanjaya - Refined */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-5 py-2 mb-6">
              <Eye className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-medium font-friendly">The Observer Program</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              {whatIsSanjaya.heading}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              {whatIsSanjaya.description?.slice(0, 2).map((desc, i) => (
                <div key={i} className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 flex items-start gap-4 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-lg text-slate-200 leading-relaxed">{desc}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 rounded-full px-4 py-2 text-sm border border-rose-500/30">
                  <span>✕</span> Not therapy or counseling
                </span>
                <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 rounded-full px-4 py-2 text-sm border border-emerald-500/30">
                  <span>✓</span> Patient listening for clarity
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl p-6 border border-amber-500/30 flex flex-col justify-center">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-amber-100 text-center leading-relaxed">
                {whatIsSanjaya.highlight_text}
              </p>
              <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-amber-500/30 text-sm text-slate-400">
                <span>5 min daily</span>
                <span>•</span>
                <span>Trained observers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer - Cards */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              What We <span className="text-gradient">Offer</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-friendly">
              Comprehensive emotional support designed for children aged 5-18
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {offers.map((offer) => {
              const Icon = offer.icon;
              const colors = colorMap[offer.color];
              const isExpanded = expandedOffer === offer.id;
              return (
                <Card 
                  key={offer.id}
                  onClick={() => setExpandedOffer(isExpanded ? null : offer.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 ${colors.border} rounded-3xl hover:shadow-xl ${isExpanded ? 'shadow-xl ring-2 ring-offset-2 ring-orange-200' : 'shadow-md'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 ${colors.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-7 h-7 ${colors.text}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{offer.title}</h3>
                          <p className="text-gray-500 font-friendly">{offer.shortDesc}</p>
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-60 mt-5 pt-5 border-t border-gray-100' : 'max-h-0'}`}>
                      <ul className="space-y-2">
                        {offer.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <CheckCircle className={`w-5 h-5 ${colors.text} flex-shrink-0`} />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Compact */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              How <span className="text-gradient-warm">Sanjaya</span> Works
            </h2>
            <p className="text-lg text-gray-500 font-friendly">Simple steps to support your child</p>
          </div>

          <div className="flex justify-center items-center gap-4 flex-wrap mb-8">
            {[
              { num: 1, title: 'Sign Up', emoji: '📝', color: 'bg-orange-500' },
              { num: 2, title: 'Get Matched', emoji: '🤝', color: 'bg-blue-500' },
              { num: 3, title: 'Daily Calls', emoji: '📞', color: 'bg-violet-500' },
              { num: 4, title: 'AI Analysis', emoji: '🧠', color: 'bg-pink-500' },
              { num: 5, title: 'Get Reports', emoji: '📊', color: 'bg-emerald-500' },
              { num: 6, title: 'Child Thrives', emoji: '🌟', color: 'bg-amber-500' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-2xl">{step.emoji}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{step.title}</span>
                </div>
                {idx < 5 && <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Privacy */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Safety & Privacy</h2>
            <p className="text-lg text-gray-500 font-friendly">Your child's safety is our top priority</p>
          </div>

          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {Object.entries(privacyTabs).map(([key, tab]) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActivePrivacyTab(key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                    activePrivacyTab === key ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-emerald-100'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.title}
                </button>
              );
            })}
          </div>

          <Card className="bg-white rounded-3xl shadow-lg border-0">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-5">
                {privacyTabs[activePrivacyTab].items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 transition-colors">
                    <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Give Your Child the Gift of Being Heard
          </h2>
          <p className="text-xl text-orange-100 mb-8 font-friendly">
            Join 500+ families who trust Sanjaya
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/get-started'}
            className="bg-white text-orange-600 hover:bg-orange-50 px-10 py-7 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all font-bold"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-orange-200 mt-4 text-sm">No credit card • Cancel anytime • 7-day free trial</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Have Questions?</h3>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Mail, title: 'Email', value: contactInfo.email, color: 'orange' },
              { icon: Phone, title: 'Phone', value: contactInfo.phone, color: 'blue' },
              { icon: MessageCircle, title: 'Live Chat', value: 'Click the icon', color: 'emerald' }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all z-50"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;
