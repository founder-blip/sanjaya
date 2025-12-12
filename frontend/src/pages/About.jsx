import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Users, Shield, Smile } from 'lucide-react';
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

const About = () => {
  const [content, setContent] = useState({
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

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/about`);
        if (response.data && Object.keys(response.data).length > 0) {
          setContent(response.data);
        }
      } catch (error) {
        console.error('Error loading about content:', error);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.hero_title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
            {content.hero_subtitle}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {content.hero_description}
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
            {content.core_values && content.core_values.map((value, index) => {
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
                  <strong className="text-gray-900">For Children:</strong> {content.intent_for_children}
                </p>
                <p>
                  <strong className="text-gray-900">For Parents:</strong> {content.intent_for_parents}
                </p>
                <p>
                  <strong className="text-gray-900">For Families:</strong> {content.intent_for_families}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We're Not Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            What Sanjaya Is Not
          </h2>
          
          <Card className="bg-gray-50 border-2 border-gray-200 rounded-3xl">
            <CardContent className="p-8">
              <ul className="space-y-4 text-lg text-gray-700">
                {content.what_we_are_not && content.what_we_are_not.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
                <p className="text-gray-800 font-medium text-center">
                  {content.disclaimer_text}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;