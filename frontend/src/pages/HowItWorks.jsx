import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Phone, Heart, Users, FileText, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Sanjaya Works
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A simple, gentle process designed around your child's comfort and your peace of mind.
          </p>
        </div>
      </section>

      {/* Step-by-Step Flow */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">1</span>
                </div>
              </div>
              <Card className="flex-1 bg-blue-50 border-2 border-blue-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Parent Enrolls Child</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    You provide consent and basic details about your child. Your consent is mandatory and can be withdrawn anytime.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-green-600">2</span>
                </div>
              </div>
              <Card className="flex-1 bg-green-50 border-2 border-green-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Child Gets Matched with Observer</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    A trained observer is assigned to your child. All observers are supervised by experienced principals.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-purple-600">3</span>
                </div>
              </div>
              <Card className="flex-1 bg-purple-50 border-2 border-purple-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Daily 5-Minute Check-In</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    The observer calls your child for a gentle, 5-minute conversation. Children share whatever they're comfortable with.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <span>No pressure to share anything specific</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <span>Observer listens without judgment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <span>Sessions are recorded per regulations</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-orange-600">4</span>
                </div>
              </div>
              <Card className="flex-1 bg-orange-50 border-2 border-orange-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Observer Notes Patterns</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    The observer notices emotional patterns over time. Not specific words, but overall mood and wellbeing trends.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 5 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-pink-600">5</span>
                </div>
              </div>
              <Card className="flex-1 bg-pink-50 border-2 border-pink-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">AI Assists with Pattern Recognition</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    AI helps identify trends from structured data. It never talks to children or makes decisions. Humans remain in control.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-8 h-8 text-gray-400 transform rotate-90" />
            </div>

            {/* Step 6 */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-indigo-600">6</span>
                </div>
              </div>
              <Card className="flex-1 bg-indigo-50 border-2 border-indigo-100 rounded-3xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Parents Receive Insights</h3>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    You receive thoughtful summaries about your child's emotional patterns. No raw transcripts, just helpful insights.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                      <span>Easy-to-read summaries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                      <span>Guidance from principals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                      <span>Delivered securely and privately</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Give your child the gift of being heard.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-full shadow-lg">
            Request Information
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;