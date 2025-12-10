import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Heart, Users, Shield, Smile } from 'lucide-react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Sanjaya Exists
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
            Every child deserves to be heard. Every parent deserves to understand their child better.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We created Sanjaya to give children a safe space to express themselves and help parents nurture their emotional growth.
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
            <Card className="border-2 border-blue-100 bg-blue-50/50 rounded-3xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Care First</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We approach every child with empathy and warmth. No judgment. No pressure. Just genuine care for their wellbeing.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 bg-green-50/50 rounded-3xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Responsibility</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We handle every interaction with care. Sessions are recorded per regulations. Parents are informed. Safety is paramount.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 bg-purple-50/50 rounded-3xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Partnership with Parents</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  We work alongside parents, not instead of them. Our insights help you guide your child's emotional journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-100 bg-orange-50/50 rounded-3xl">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Smile className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gentle Support</h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  This is not therapy or counseling. It's gentle emotional support to help children feel valued and heard.
                </p>
              </CardContent>
            </Card>
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
                  <strong className="text-gray-900">For Children:</strong> We want to create a space where you can share your thoughts and feelings freely, knowing someone is truly listening.
                </p>
                <p>
                  <strong className="text-gray-900">For Parents:</strong> We want to help you understand your child's emotional world better, so you can support them in meaningful ways.
                </p>
                <p>
                  <strong className="text-gray-900">For Families:</strong> We believe stronger emotional connections make happier families.
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
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                  <span>Not a replacement for therapy or professional mental health care</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                  <span>Not a diagnostic service</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                  <span>Not a crisis intervention service</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 text-xl flex-shrink-0">❌</span>
                  <span>Not medical or clinical treatment</span>
                </li>
              </ul>

              <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
                <p className="text-gray-800 font-medium text-center">
                  If your child needs professional help, we encourage you to seek appropriate clinical support. Sanjaya complements, but does not replace, professional care.
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