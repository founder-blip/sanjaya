import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, BarChart3, Shield, Zap, Target, Award, ArrowRight, Phone, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalLanding = () => {
  const [content, setContent] = useState({
    hero_title: 'Empower Your Institution',
    hero_subtitle: 'Transform student outcomes with AI-powered observation.',
    features: [],
    benefits: [],
    testimonials: [],
    cta_title: 'Ready to Transform Your Institution?',
    cta_description: 'Join leading schools in providing exceptional care.'
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/principal`);
        if (response.data && Object.keys(response.data).length > 0) {
          setContent(response.data);
        }
      } catch (error) {
        console.error('Error loading principal content:', error);
      }
    };
    loadContent();
  }, []);

  const features = content.features.length > 0 ? content.features : [
    {
      icon: Users,
      title: 'Manage Your Observer Team',
      description: 'Nominate, train, and oversee observers with comprehensive management tools.'
    },
    {
      icon: BarChart3,
      title: 'AI-Powered Analytics',
      description: 'Access detailed insights and patterns identified by our advanced AI system.'
    },
    {
      icon: Shield,
      title: 'Ensure Quality & Privacy',
      description: 'Monitor program quality while maintaining strict confidentiality standards.'
    },
    {
      icon: Zap,
      title: 'Real-Time Dashboards',
      description: 'Track progress, trends, and outcomes across all children in real-time.'
    },
    {
      icon: Target,
      title: 'Guide Parents Effectively',
      description: 'Provide parents with actionable insights based on comprehensive data.'
    },
    {
      icon: Award,
      title: 'Measure Impact',
      description: 'Demonstrate tangible improvements in children\'s soft skills and confidence.'
    }
  ];

  const benefits = [
    'Enhance your institution\'s value proposition',
    'Differentiate from competitors',
    'Improve student outcomes measurably',
    'Strengthen parent relationships',
    'Access cutting-edge AI technology',
    'Comprehensive training and support',
    'Flexible implementation model',
    'Proven success metrics'
  ];

  const testimonials = [
    {
      name: 'Dr. Sharma',
      school: 'Greenwood International School',
      text: 'Implementing Sanjaya has transformed how we understand and support our students. Parents are more engaged, and we\'ve seen remarkable improvements in student confidence.'
    },
    {
      name: 'Mrs. Kapoor',
      school: 'Bright Future Academy',
      text: 'The AI-powered insights help us identify issues early and provide targeted support. It\'s been a game-changer for our institution.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="px-6 py-2 text-lg bg-blue-100 text-blue-700 border-2 border-blue-300 mb-6">
            For Educational Leaders
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Empower Your Institution
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform student outcomes with AI-powered observation and insights.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              Partner With Us
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              <Phone className="mr-2" />
              Request a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Why Leading Schools Choose Sanjaya</h2>
              <p className="text-lg text-gray-600 mb-6">
                In today's competitive educational landscape, institutions need more than academic excellence. Parents are looking for schools that truly understand and nurture their children's emotional and social development.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Sanjaya provides you with the tools, insights, and support to deliver exceptional holistic care – creating measurable improvements in student confidence, communication skills, and emotional intelligence.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">87%</div>
                  <div className="text-sm text-gray-600">Parent Satisfaction Increase</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">92%</div>
                  <div className="text-sm text-gray-600">Student Confidence Improvement</div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-full h-96 bg-gradient-to-br from-purple-200 to-purple-300 rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="text-8xl">🏫</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">Comprehensive Platform Features</h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Everything you need to implement and manage a successful observation program
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works for Principals */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">Your Implementation Journey</h2>
          <div className="space-y-8">
            {[
              { step: 1, title: 'Partnership Setup', description: 'We work with you to customize the program for your institution\'s unique needs and culture.' },
              { step: 2, title: 'Observer Selection & Training', description: 'Nominate your team members and we\'ll provide comprehensive training on our methodology.' },
              { step: 3, title: 'Parent Communication', description: 'We help you communicate the program\'s value to parents and get their enrollment.' },
              { step: 4, title: 'Program Launch', description: 'Observers begin daily interactions with students, with full platform access for monitoring.' },
              { step: 5, title: 'Continuous Insights', description: 'Review AI-generated analytics, guide parents, and demonstrate measurable impact.' }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-102">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-lg">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">Benefits for Your Institution</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105">
                <CardContent className="p-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">What Principals Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
                <CardContent className="p-8">
                  <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-purple-300 rounded-full flex items-center justify-center">
                      <span className="text-xl">👨‍💼</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Flexible Pricing Models</h2>
          <p className="text-xl text-gray-600 mb-8">
            We offer customized pricing based on your institution's size and needs. Our model scales with you – from pilot programs to full institution rollouts.
          </p>
          <Button size="lg" variant="outline" className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg rounded-full">
            Discuss Pricing
          </Button>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join leading schools in providing exceptional holistic care for your students.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
              Schedule a Demo
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-12 py-6 text-xl rounded-full shadow-lg">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrincipalLanding;