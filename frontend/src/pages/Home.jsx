import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, CheckCircle, Users, Phone, Clock, Heart, ArrowRight, Mail, MessageCircle, Star, Sparkles, Calendar, Award } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Warm & Child-Centric */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-100 rounded-full px-6 py-2 mb-6">
                <p className="text-orange-700 font-semibold">🌟 Every Child Deserves to Be Heard</p>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Nurturing Your Child's Emotional Voice
              </h1>
              
              <p className="text-2xl text-gray-700 mb-4 font-medium">
                Daily Emotional Support Through Caring Conversations
              </p>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Sanjaya connects your child with trained observers for gentle 5-minute daily check-ins, helping them express feelings and build emotional confidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-7 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-10 py-7 text-xl rounded-full shadow-lg">
                  Watch How It Works
                </Button>
              </div>

              <div className="flex items-center gap-8 flex-wrap">
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
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full opacity-60 animate-pulse delay-75"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Founder Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 rounded-full px-6 py-2 mb-6">
              <p className="text-orange-700 font-semibold">👋 Meet Our Founder</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Meet Our Founder</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-full overflow-hidden shadow-2xl ring-8 ring-orange-200">
                  <img 
                    src="/images/punam-jaiswal.jpg" 
                    alt="Smt. Punam Jaiswal" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-full shadow-xl">
                  <p className="text-center font-bold text-gray-900 text-lg">Smt. Punam Jaiswal</p>
                  <p className="text-center text-orange-600 font-semibold">Founder and Former Principal</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                With years of experience in education and child psychology, Punam Ma'am, as a former principal, brings an unique blend of empathy and expertise to every interaction. Her gentle approach and profound understanding of children's needs make her the ideal guide for your child's inner growth journey.
              </p>
              
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-6 rounded-r-2xl">
                <div className="flex items-start gap-3">
                  <span className="text-4xl text-orange-500">"</span>
                  <div>
                    <p className="text-gray-800 italic text-lg leading-relaxed mb-2">
                      Every child has a story to tell. My role is simply to listen, understand, and help parents see the beautiful complexity of their child's world.
                    </p>
                    <p className="text-gray-700 font-semibold">— Smt. Punam Jaiswal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Sanjaya - The Observer Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              What is Sanjaya – The Observer?
            </h2>
          </div>

          <Card className="border-2 border-orange-200 rounded-3xl bg-white shadow-2xl">
            <CardContent className="p-10">
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p className="text-xl font-medium text-gray-900">
                  Sanjaya is a specialized, non-judgmental listening support system.
                </p>
                
                <p className="text-xl font-medium text-gray-900">
                  A confidential companion to help your child process their inner world.
                </p>
                
                <div className="flex items-start gap-3 my-6">
                  <span className="text-red-600 text-2xl flex-shrink-0">✕</span>
                  <p className="text-xl font-medium text-gray-700">
                    Not counseling, therapy, or teaching.
                  </p>
                </div>
                
                <div className="flex items-start gap-3 my-6">
                  <span className="text-green-600 text-2xl flex-shrink-0">✓</span>
                  <p className="text-xl font-medium text-gray-900">
                    We listen patiently and your child finds their own clarity.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-8 my-8">
                  <p className="text-2xl font-bold text-gray-900 text-center">
                    Sanjaya – The Observer is India's first structured daily observation program supervised by Legendary Principals.
                  </p>
                </div>

                <p className="text-xl text-gray-700 text-center">
                  Every child is paired with a trained ethical observer who listens to them for 5 minutes a day and simply documents what they heard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-purple-100 rounded-full px-6 py-2 mb-6">
              <p className="text-purple-700 font-semibold">🎯 Our Services</p>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Comprehensive emotional support designed for children aged 5-18
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-orange-200 rounded-3xl bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Emotional Check-Ins</h3>
                    <p className="text-gray-600 text-lg">
                      Short, gentle 5-minute phone conversations every day where children can freely express their thoughts and feelings.
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 ml-20">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Consistent daily routine</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">No pressure to share</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Age-appropriate conversations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 rounded-3xl bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Emotional Pattern Recognition</h3>
                    <p className="text-gray-600 text-lg">
                      Our trained observers notice emotional trends and patterns that help understand your child better.
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 ml-20">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">AI-assisted insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Human review & validation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Long-term trend tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 rounded-3xl bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Personalized Parent Reports</h3>
                    <p className="text-gray-600 text-lg">
                      Receive weekly summaries with actionable insights about your child's emotional wellbeing.
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 ml-20">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Easy-to-understand summaries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Principal guidance included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Secure & confidential</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 rounded-3xl bg-white shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Flexible Scheduling</h3>
                    <p className="text-gray-600 text-lg">
                      Automated scheduling adapts to your child's routine for consistent, convenient check-ins.
                    </p>
                  </div>
                </div>
                <ul className="space-y-3 ml-20">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Smart call scheduling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Weekend support available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Adjust timing anytime</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Timeline */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-100 rounded-full px-6 py-2 mb-6">
              <p className="text-yellow-700 font-semibold">🚀 Simple Process</p>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How Sanjaya Works
            </h2>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              From enrollment to insights, here's the complete journey
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-300 via-purple-300 to-green-300 hidden sm:block"></div>

            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: 'Sign Up & Enroll',
                  description: 'Create your account and enroll your child. Provide basic details and consent.',
                  color: 'from-orange-400 to-orange-600',
                  bgColor: 'bg-orange-100',
                  icon: '📝'
                },
                {
                  step: 2,
                  title: 'Get Matched with Observer',
                  description: 'We pair your child with a trained, caring observer supervised by principals.',
                  color: 'from-blue-400 to-blue-600',
                  bgColor: 'bg-blue-100',
                  icon: '👥'
                },
                {
                  step: 3,
                  title: 'Daily Check-In Begins',
                  description: 'Observer calls daily for friendly 5-minute conversations. Your child shares at their pace.',
                  color: 'from-purple-400 to-purple-600',
                  bgColor: 'bg-purple-100',
                  icon: '📞'
                },
                {
                  step: 4,
                  title: 'Patterns Identified',
                  description: 'Our system notices emotional trends. AI assists, but humans always review.',
                  color: 'from-pink-400 to-pink-600',
                  bgColor: 'bg-pink-100',
                  icon: '🧠'
                },
                {
                  step: 5,
                  title: 'Parent Reports Generated',
                  description: 'Principals prepare thoughtful summaries with actionable insights.',
                  color: 'from-green-400 to-green-600',
                  bgColor: 'bg-green-100',
                  icon: '📊'
                },
                {
                  step: 6,
                  title: 'Your Child Thrives',
                  description: 'With consistent support, children become more confident and emotionally aware.',
                  color: 'from-teal-400 to-teal-600',
                  bgColor: 'bg-teal-100',
                  icon: '🌟'
                }
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <Card className={`inline-block border-2 ${item.bgColor} rounded-3xl shadow-lg hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-4xl">{item.icon}</span>
                          <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                        </div>
                        <p className="text-gray-700 text-lg">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl z-10 flex-shrink-0`}>
                    {item.step}
                  </div>
                  
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Child's Safety is Our Promise
            </h2>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We take trust, privacy, and safety seriously at every step
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Parent Consent Required', description: 'Your explicit permission is mandatory before we begin.' },
              { title: 'Trained & Supervised', description: 'All observers are trained and supervised by principals.' },
              { title: 'Secure Recordings', description: 'Sessions recorded and stored per regulations.' },
              { title: 'Not Clinical Treatment', description: 'Emotional support, not therapy or counseling.' },
              { title: 'You Control Data', description: 'Access insights anytime. Cancel whenever you want.' },
              { title: 'Human-Led, AI-Assisted', description: 'AI helps spot patterns. Humans make decisions.' }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-green-200 rounded-2xl bg-white hover:shadow-xl transition-all">
                <CardContent className="p-6 flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-orange-100 rounded-full px-6 py-2 mb-6">
              <p className="text-orange-700 font-semibold">💌 Get in Touch</p>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-12">
              Join hundreds of families who trust Sanjaya to support their children's emotional growth
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-7 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
                Start Free Trial
                <ArrowRight className="ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-12 py-7 text-xl rounded-full shadow-lg">
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
                <p className="text-gray-600 mb-2">support@sanjaya.com</p>
                <p className="text-gray-500 text-sm">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-xl">Call Us</h4>
                <p className="text-gray-600 mb-2">+91 98765 43210</p>
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
