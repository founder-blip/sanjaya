import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shield, CheckCircle, Users, Phone, Clock, Heart, ArrowRight, Mail, MessageCircle } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Daily Emotional Support for Your Child
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Sanjaya helps children express feelings and build emotional confidence through short daily check-ins with trained observers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full">
                  Schedule a Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>No long-term commitment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                <img 
                  src="/images/punam-jaiswal.jpg" 
                  alt="Happy child with parent" 
                  className="rounded-2xl w-full h-96 object-cover shadow-lg"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Happy Children</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Many Children Struggle to Express Their Emotions
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Between school, activities, and busy family schedules, children often don't have a dedicated space to share how they're really feeling.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-100 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😔</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Bottled Up Feelings</h3>
                <p className="text-gray-600 leading-relaxed">
                  Children keep emotions inside, leading to stress and anxiety.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Safe Outlet</h3>
                <p className="text-gray-600 leading-relaxed">
                  Parents are busy, and children don't want to burden them.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">😟</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Unnoticed Patterns</h3>
                <p className="text-gray-600 leading-relaxed">
                  Small emotional changes go unnoticed until they become big problems.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3-Step Solution Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              How Sanjaya Helps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A simple, gentle process that makes emotional wellbeing a daily habit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <Card className="border-2 border-blue-200 rounded-3xl bg-blue-50 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Daily 5-Minute Check-In</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Your child receives a friendly call from their trained observer. No pressure, just a warm conversation about their day.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="border-2 border-purple-200 rounded-3xl bg-purple-50 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Patterns Identified</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Observers notice emotional patterns and trends. AI assists by identifying themes across conversations.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="border-2 border-green-200 rounded-3xl bg-green-50 h-full">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">You Get Insights</h3>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Receive thoughtful summaries about your child's emotional wellbeing, helping you support them better.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Child's Safety is Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We take trust, privacy, and safety seriously. Here's how we protect your child.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Parent Consent Required</h4>
                  <p className="text-gray-600">Your explicit consent is mandatory. You control everything.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Trained & Supervised Observers</h4>
                  <p className="text-gray-600">All observers are trained and supervised by experienced principals.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Sessions Recorded Securely</h4>
                  <p className="text-gray-600">All calls are recorded and stored securely per regulations.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Not Clinical Treatment</h4>
                  <p className="text-gray-600">This is emotional support, not therapy or counseling.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">You Control Your Data</h4>
                  <p className="text-gray-600">Access your child's insights anytime. Cancel whenever you want.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 rounded-2xl">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Human-Led, AI-Assisted</h4>
                  <p className="text-gray-600">AI helps spot patterns, but humans make all decisions.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Visual Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              The Complete Process
            </h2>
            <p className="text-xl text-gray-600">
              From enrollment to insights, here's how Sanjaya works end-to-end.
            </p>
          </div>

          <div className="relative">
            {/* Vertical line connector */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 via-purple-300 to-green-300 hidden md:block"></div>

            <div className="space-y-8">
              {[
                { 
                  icon: '📝', 
                  title: 'You Enroll Your Child', 
                  description: 'Sign up online and provide consent. Choose your plan and schedule preferences.',
                  color: 'blue'
                },
                { 
                  icon: '👥', 
                  title: 'We Match an Observer', 
                  description: 'Your child is paired with a caring, trained observer supervised by principals.',
                  color: 'purple'
                },
                { 
                  icon: '📞', 
                  title: 'Daily Check-Ins Begin', 
                  description: 'Observer calls for 5-minute conversations. Your child shares at their own pace.',
                  color: 'indigo'
                },
                { 
                  icon: '🧠', 
                  title: 'AI Identifies Patterns', 
                  description: 'Our system notices emotional trends and themes across conversations.',
                  color: 'violet'
                },
                { 
                  icon: '📊', 
                  title: 'Principal Reviews Data', 
                  description: 'Experienced principals review patterns and prepare parent-friendly summaries.',
                  color: 'purple'
                },
                { 
                  icon: '📧', 
                  title: 'You Receive Insights', 
                  description: 'Get weekly summaries highlighting your child\\'s emotional wellbeing trends.',
                  color: 'green'
                }
              ].map((step, index) => (
                <div key={index} className="flex gap-6 items-start relative">
                  <div className={`w-16 h-16 bg-${step.color}-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0 z-10 shadow-lg`}>
                    {step.icon}
                  </div>
                  <Card className={`flex-1 border-2 border-${step.color}-100 rounded-2xl`}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your family. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200 rounded-3xl">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-gray-600">Perfect for getting started</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">₹1,499</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">5-minute daily check-ins (5 days/week)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Trained observer matched to your child</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Weekly summary reports</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>

                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg rounded-full">
                  Start Basic Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-blue-500 rounded-3xl relative shadow-xl">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600">For complete emotional support</p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">₹2,499</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700"><strong>7-day check-ins</strong> with weekend support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Priority observer matching</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700"><strong>Daily micro-insights</strong> + weekly summaries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Monthly video consultation with principal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Priority phone & email support</span>
                  </li>
                </ul>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-full">
                  Start Premium Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-gray-600 mt-8">
            All plans include a <strong>7-day free trial</strong>. No credit card required.
          </p>
        </div>
      </section>

      {/* Contact / CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Support Your Child's Emotional Growth?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join hundreds of families who trust Sanjaya to nurture their children's emotional wellbeing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-xl rounded-full shadow-lg">
              Get Started Now
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-6 text-xl rounded-full">
              <Phone className="mr-2" />
              Talk to Us
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <Card className="border-2 border-gray-100 rounded-2xl">
              <CardContent className="p-6">
                <Mail className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Email Us</h4>
                <p className="text-gray-600 text-sm mb-2">support@sanjaya.com</p>
                <p className="text-gray-500 text-xs">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 rounded-2xl">
              <CardContent className="p-6">
                <Phone className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Call Us</h4>
                <p className="text-gray-600 text-sm mb-2">+91 98765 43210</p>
                <p className="text-gray-500 text-xs">Mon-Fri, 9 AM - 6 PM</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 rounded-2xl">
              <CardContent className="p-6">
                <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Live Chat</h4>
                <p className="text-gray-600 text-sm mb-2">Instant support</p>
                <p className="text-gray-500 text-xs">Click the chat icon below</p>
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
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all z-50"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;
