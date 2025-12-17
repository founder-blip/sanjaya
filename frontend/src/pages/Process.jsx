import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Users, Shield, Smile, Phone, FileText, TrendingUp, CheckCircle, ArrowRight, Eye, Sparkles, Target, Clock, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Process = () => {
  const [aboutContent, setAboutContent] = useState({
    hero_title: 'Our Process',
    hero_subtitle: 'A gentle, structured approach to understanding your child better.',
    hero_description: 'Sanjaya provides daily emotional check-ins with trained observers, helping children express themselves while giving parents meaningful insights.',
    core_values: [
      { title: 'Care First', description: 'Every interaction is rooted in genuine care for your child\'s wellbeing.', icon: 'Heart', color: 'blue' },
      { title: 'Trust & Safety', description: 'Building a safe space where children feel comfortable to share.', icon: 'Shield', color: 'green' },
      { title: 'Family Partnership', description: 'Working together with parents to support children\'s growth.', icon: 'Users', color: 'purple' },
      { title: 'Joyful Connection', description: 'Making every conversation a positive experience.', icon: 'Smile', color: 'orange' }
    ],
    intent_for_children: 'A safe, non-judgmental space to express their thoughts and feelings freely.',
    intent_for_parents: 'Meaningful insights into your child\'s emotional world without invading their privacy.',
    intent_for_families: 'Stronger bonds through better understanding and communication.',
    what_we_are_not: [
      'Not therapy or clinical treatment',
      'Not counseling or psychological intervention',
      'Not a replacement for professional mental health care',
      'Not academic tutoring or coaching'
    ],
    disclaimer_text: 'Sanjaya is an emotional support and observation program, not a medical service. For clinical concerns, please consult a licensed professional.'
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const aboutRes = await axios.get(`${BACKEND_URL}/api/content/about`).catch(() => ({ data: null }));
        if (aboutRes.data && Object.keys(aboutRes.data).length > 0) {
          setAboutContent(prev => ({ ...prev, ...aboutRes.data }));
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    loadContent();
  }, []);

  const iconMap = {
    'Heart': Heart,
    'Shield': Shield,
    'Users': Users,
    'Smile': Smile
  };

  const colorClasses = {
    'blue': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    'green': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
    'purple': { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
    'orange': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' }
  };

  const steps = [
    {
      number: 1,
      title: 'Parent Enrolls Child',
      description: 'You provide consent and basic details about your child. Your consent is mandatory and can be withdrawn anytime.',
      icon: CheckCircle,
      color: 'bg-blue-500',
      details: ['Complete online registration', 'Review and sign consent form', 'Share child\'s schedule preferences']
    },
    {
      number: 2,
      title: 'Child Gets Matched',
      description: 'A trained observer is assigned to your child based on age, interests, and availability.',
      icon: Users,
      color: 'bg-green-500',
      details: ['Carefully matched observer', 'All observers background-verified', 'Supervised by experienced principals']
    },
    {
      number: 3,
      title: 'Daily 5-Minute Check-In',
      description: 'The observer calls your child for a gentle conversation. Children share whatever they\'re comfortable with.',
      icon: Phone,
      color: 'bg-purple-500',
      details: ['No pressure to share', 'Child-led conversations', 'Consistent daily routine']
    },
    {
      number: 4,
      title: 'Patterns Are Documented',
      description: 'The observer notes emotional patterns over time - not specific words, but overall mood trends.',
      icon: Eye,
      color: 'bg-orange-500',
      details: ['Mood tracking', 'Behavioral patterns noted', 'Progress documented']
    },
    {
      number: 5,
      title: 'AI Assists Analysis',
      description: 'AI helps identify trends from structured data. It never talks to children. Humans always review.',
      icon: TrendingUp,
      color: 'bg-pink-500',
      details: ['Pattern recognition', 'Trend analysis', 'Human oversight always']
    },
    {
      number: 6,
      title: 'Parents Receive Insights',
      description: 'You receive thoughtful summaries about your child\'s emotional patterns with actionable guidance.',
      icon: FileText,
      color: 'bg-indigo-500',
      details: ['Weekly summaries', 'Principal guidance included', 'Actionable recommendations']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-300"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-medium">How We Support Your Child</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
            {aboutContent.hero_title}
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 leading-relaxed mb-4">
            {aboutContent.hero_subtitle}
          </p>
          <p className="text-lg text-purple-200 leading-relaxed max-w-2xl mx-auto">
            {aboutContent.hero_description}
          </p>
        </div>
      </section>

      {/* The 6-Step Journey - Compact Grid */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              The Sanjaya Journey
            </h2>
            <p className="text-lg text-gray-600">
              A simple, 6-step process designed around your child's comfort
            </p>
          </div>

          {/* Compact 3-column Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                          <span className="text-white font-bold text-lg">{step.number}</span>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <h3 className="font-bold text-gray-900 truncate">{step.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">{step.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {step.details.slice(0, 2).map((detail, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {detail}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Visual Flow Indicator */}
          <div className="flex justify-center items-center gap-2 mt-8">
            {[1, 2, 3, 4, 5, 6].map((num, idx) => (
              <React.Fragment key={num}>
                <div className={`w-8 h-8 ${steps[idx].color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {num}
                </div>
                {idx < 5 && <ArrowRight className="w-4 h-4 text-gray-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            What We Stand For
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our core values guide every interaction with your child
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutContent.core_values && aboutContent.core_values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Heart;
              const colors = colorClasses[value.color] || colorClasses['blue'];
              
              return (
                <Card key={index} className={`border-2 ${colors.border} rounded-2xl hover:shadow-lg transition-all`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Intent */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Our Intent
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-2 border-blue-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Smile className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Children</h3>
                <p className="text-gray-600">{aboutContent.intent_for_children}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-green-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Parents</h3>
                <p className="text-gray-600">{aboutContent.intent_for_parents}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-purple-200 rounded-2xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">For Families</h3>
                <p className="text-gray-600">{aboutContent.intent_for_families}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We're Not + Disclaimer */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Important Clarifications
          </h2>
          
          <Card className="bg-gray-50 border-2 border-gray-200 rounded-2xl mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-gray-600" />
                What Sanjaya Is Not
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {aboutContent.what_we_are_not && aboutContent.what_we_are_not.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-xl">
                    <span className="text-red-500 text-lg">✕</span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {aboutContent.disclaimer_text && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
              <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">
                {aboutContent.disclaimer_text}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Single CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Support Your Child's Emotional Growth?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join hundreds of families who trust Sanjaya to help their children express themselves freely.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/get-started'}
            className="bg-white text-orange-600 hover:bg-orange-50 px-10 py-7 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-orange-200 mt-4 text-sm">
            No credit card required • Cancel anytime • 7-day free trial
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Process;
