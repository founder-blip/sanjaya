import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Shield, Users, CheckCircle, Phone, Mail, MessageCircle, Clock, Smile, TrendingUp } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Clear & Simple */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Nurturing Your Child's Voice
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Every Child Needs To Be Heard And Valued
          </p>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sanjaya provides gentle daily emotional check-ins for children, guided by trained observers. Not therapy. Not counseling. Just caring support.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
            Learn How It Works
          </Button>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            The Challenge Every Parent Faces
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Children often struggle to express emotions during busy school days.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🤫</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Many feelings go unnoticed or unspoken.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-100">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">❤️</div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Parents want to support but don't always know how.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Explanation Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            How Sanjaya Helps
          </h2>
          <p className="text-center text-xl text-gray-600 mb-12">Simple. Gentle. Effective.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-2 border-blue-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-6xl font-bold text-blue-600 mb-4">1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Short Daily Check-In</h3>
                <p className="text-gray-700 leading-relaxed">
                  Children have short, gentle emotional check-ins with trained observers. Just 5 minutes a day.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-blue-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-6xl font-bold text-blue-600 mb-4">2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Patterns Are Noticed</h3>
                <p className="text-gray-700 leading-relaxed">
                  Trained observers notice patterns, not words. They listen without judgment.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-blue-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-6xl font-bold text-blue-600 mb-4">3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Parents Get Insights</h3>
                <p className="text-gray-700 leading-relaxed">
                  Parents receive thoughtful summaries to better understand their child's emotional world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Observer Explanation Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Who Are Observers?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-green-50 border-2 border-green-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Observers DO:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Listen with care and patience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Notice emotional patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Create a safe space for expression</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">Share insights with parents</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-2 border-red-200">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">❌</span>
                  Observers DO NOT:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span className="text-gray-700">Provide therapy or counseling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span className="text-gray-700">Diagnose any conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span className="text-gray-700">Give medical advice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                    <span className="text-gray-700">Replace professional help when needed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 bg-blue-50 border-2 border-blue-200">
            <CardContent className="p-6 text-center">
              <p className="text-lg text-gray-800 font-medium">
                Observers are trained listeners, not therapists or counselors. They help children feel heard.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Meet Our Founder</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                With years of experience in education and understanding child psychology, Punam Ma'am, as Principal, brings a unique blend of empathy and expertise to every interaction.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Her gentle approach and profound understanding of children's needs make her the ideal guide for your child's growth journey.
              </p>
            </div>
            <div className="order-1 md:order-2 flex flex-col items-center">
              <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl mb-6">
                <img 
                  src="/images/punam-jaiswal.jpg" 
                  alt="Punam Jaiswal - Founder and Former Principal" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xl text-blue-600 font-semibold text-center">Founder and Former Principal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section - Prominent */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Your Child's Safety & Privacy
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Non-Clinical Program</h3>
                <p className="text-blue-100 leading-relaxed">
                  This is not therapy. This is gentle emotional support to help children feel heard.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Parent Consent Required</h3>
                <p className="text-blue-100 leading-relaxed">
                  Your explicit consent is mandatory. You're in control at every step.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-2 border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Human-Led, AI-Assisted</h3>
                <p className="text-blue-100 leading-relaxed">
                  Real people guide the process. AI only helps identify patterns.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6">Additional Safety Measures</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <p className="text-blue-100">All sessions are recorded and stored securely per regulations</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <p className="text-blue-100">Observers are trained and supervised by principals</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <p className="text-blue-100">Parents receive regular updates and reports</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" />
                <p className="text-blue-100">You can opt out at any time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Explanation Section - Minimal & Reassuring */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
            How We Use AI
          </h2>
          
          <Card className="bg-white border-2 border-gray-200">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI Identifies Patterns</h3>
                    <p className="text-gray-700 leading-relaxed">
                      AI helps identify patterns from structured data only. It looks at trends over time to help observers and parents understand what matters.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">❌</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI Never Talks to Children</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Children only interact with trained human observers. AI never talks to, evaluates, or engages with children directly.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Humans Make Decisions</h3>
                    <p className="text-gray-700 leading-relaxed">
                      AI never makes decisions. Trained principals and observers review all insights and guide parents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <p className="text-center text-lg text-gray-800 font-medium">
                  Think of AI as a helpful assistant that spots patterns, while humans provide the care, guidance, and decision-making.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call-to-Action Section - Gentle & Reassuring */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Give Your Child a Safe Space to Be Heard
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Join families who trust Sanjaya to nurture their children's emotional wellbeing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
              <Phone className="mr-2" />
              Request Information
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full">
              <Mail className="mr-2" />
              Email Us
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            Have questions? We're here to help. No pressure, just caring support.
          </p>
        </div>
      </section>

      <Footer />
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;