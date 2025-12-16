import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Users, Shield, Smile, Phone, FileText, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  'Heart': Heart,
  'Shield': Shield,
  'Users': Users,
  'Smile': Smile
};

const Process = () => {
  const [aboutContent, setAboutContent] = useState({
    hero_title: 'Why Sanjaya Exists',
    hero_subtitle: 'Every child deserves to be heard. Every parent deserves to understand their child better.',
    hero_description: 'We created Sanjaya to give children a safe space to express themselves and help parents nurture their emotional growth.',
    core_values: [],
    intent_for_children: '',
    intent_for_parents: '',
    intent_for_families: '',
    what_we_are_not: [],
    disclaimer_text: ''
  });

  const [howContent, setHowContent] = useState({
    hero_title: 'How Sanjaya Works',
    hero_description: 'A simple, gentle process designed around your child\'s comfort and your peace of mind.',
    cta_title: 'Ready to Get Started?',
    cta_description: 'Give your child the gift of being heard.'
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [aboutRes, howRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/content/about`).catch(() => ({ data: null })),
          axios.get(`${BACKEND_URL}/api/content/how-it-works-page`).catch(() => ({ data: null }))
        ]);
        
        if (aboutRes.data && Object.keys(aboutRes.data).length > 0) {
          setAboutContent(aboutRes.data);
        }
        if (howRes.data && Object.keys(howRes.data).length > 0) {
          setHowContent(howRes.data);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Why We Exist */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {aboutContent.hero_title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
            {aboutContent.hero_subtitle}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {aboutContent.hero_description}
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What We Stand For
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {aboutContent.core_values && aboutContent.core_values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Heart;
              const colorMap = {
                'blue': 'border-blue-100 bg-blue-50/50',
                'green': 'border-green-100 bg-green-50/50',
                'purple': 'border-purple-100 bg-purple-50/50',
                'orange': 'border-orange-100 bg-orange-50/50'
              };
              const iconColorMap = {
                'blue': 'bg-blue-100 text-blue-600',
                'green': 'bg-green-100 text-green-600',
                'purple': 'bg-purple-100 text-purple-600',
                'orange': 'bg-orange-100 text-orange-600'
              };
              return (
                <Card key={index} className={`border-2 ${colorMap[value.color]} rounded-3xl`}>
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 ${iconColorMap[value.color]} rounded-full flex items-center justify-center mb-6`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Intent Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            Our Intent
          </h2>
          
          <Card className="bg-white border-2 border-blue-100 rounded-3xl">
            <CardContent className="p-8">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  <strong className="text-gray-900">For Children:</strong> {aboutContent.intent_for_children}
                </p>
                <p>
                  <strong className="text-gray-900">For Parents:</strong> {aboutContent.intent_for_parents}
                </p>
                <p>
                  <strong className="text-gray-900">For Families:</strong> {aboutContent.intent_for_families}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {howContent.hero_title}
            </h2>
            <p className="text-xl text-gray-600">
              {howContent.hero_description}
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">1</span>
                </div>
              </div>
              <Card className="flex-1 bg-blue-50 border-2 border-blue-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Parent Enrolls Child</h3>
                  </div>
                  <p className="text-gray-700">
                    You provide consent and basic details about your child. Your consent is mandatory and can be withdrawn anytime.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">2</span>
                </div>
              </div>
              <Card className="flex-1 bg-green-50 border-2 border-green-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900">Child Gets Matched with Observer</h3>
                  </div>
                  <p className="text-gray-700">
                    A trained observer is assigned to your child. All observers are supervised by experienced principals.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-purple-600">3</span>
                </div>
              </div>
              <Card className="flex-1 bg-purple-50 border-2 border-purple-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Daily 5-Minute Check-In</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    The observer calls your child for a gentle, 5-minute conversation. Children share whatever they're comfortable with.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>No pressure to share anything specific</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Observer listens without judgment</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-orange-600">4</span>
                </div>
              </div>
              <Card className="flex-1 bg-orange-50 border-2 border-orange-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-bold text-gray-900">Observer Notes Patterns</h3>
                  </div>
                  <p className="text-gray-700">
                    The observer notices emotional patterns over time. Not specific words, but overall mood and wellbeing trends.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 5 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-pink-600">5</span>
                </div>
              </div>
              <Card className="flex-1 bg-pink-50 border-2 border-pink-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-pink-600" />
                    <h3 className="text-xl font-bold text-gray-900">AI Assists with Pattern Recognition</h3>
                  </div>
                  <p className="text-gray-700">
                    AI helps identify trends from structured data. It never talks to children or makes decisions. Humans remain in control.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 6 */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600">6</span>
                </div>
              </div>
              <Card className="flex-1 bg-indigo-50 border-2 border-indigo-100 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-900">Parents Receive Insights</h3>
                  </div>
                  <p className="text-gray-700 mb-3">
                    You receive thoughtful summaries about your child's emotional patterns. No raw transcripts, just helpful insights.
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                      <span>Easy-to-read summaries with guidance from principals</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What We're Not Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            What Sanjaya Is Not
          </h2>
          
          <Card className="bg-white border-2 border-gray-200 rounded-3xl">
            <CardContent className="p-8">
              <ul className="space-y-4 text-lg text-gray-700">
                {aboutContent.what_we_are_not && aboutContent.what_we_are_not.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {aboutContent.disclaimer_text && (
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
                  <p className="text-gray-800 font-medium text-center">
                    {aboutContent.disclaimer_text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {howContent.cta_title}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {howContent.cta_description}
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/get-started'}
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full shadow-lg"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Process;
