import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Heart, Clock, BookOpen, Award, TrendingUp, CheckCircle, ArrowRight, Phone } from 'lucide-react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const ObserverLanding = () => {
  const responsibilities = [
    {
      icon: Heart,
      title: 'Listen with Empathy',
      description: 'Create a safe space where children feel comfortable sharing their thoughts and feelings.'
    },
    {
      icon: Clock,
      title: 'Dedicate 5 Minutes Daily',
      description: 'Commit to consistent daily interactions with each child assigned to you.'
    },
    {
      icon: BookOpen,
      title: 'Document Observations',
      description: 'Note important cues, patterns, and developmental progress in your reports.'
    },
    {
      icon: Award,
      title: 'Celebrate Progress',
      description: 'Recognize and encourage every small win in a child\'s journey.'
    },
    {
      icon: TrendingUp,
      title: 'Track Development',
      description: 'Monitor soft skill growth and emotional development over time.'
    },
    {
      icon: CheckCircle,
      title: 'Maintain Confidentiality',
      description: 'Ensure all conversations remain private and secure.'
    }
  ];

  const benefits = [
    'Comprehensive training program',
    'Flexible working hours',
    'Make a meaningful impact',
    'Work with expert principals',
    'Continuous professional development',
    'Competitive compensation'
  ];

  const qualifications = [
    'Background in education, psychology, or child development',
    'Excellent listening and communication skills',
    'Patience and empathy towards children',
    'Commitment to confidentiality and ethics',
    'Available for 1-2 hours daily',
    'Fluent in [language requirements]'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="px-6 py-2 text-lg bg-purple-100 text-purple-700 border-2 border-purple-300 mb-6">
            Join Our Observer Team
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Become an Observer
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform lives by simply listening. Make a difference in children's lives every single day.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              Apply Now
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              <Phone className="mr-2" />
              Schedule a Call
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Your Role, Your Impact</h2>
              <p className="text-lg text-gray-600 mb-6">
                As an Observer at Sanjaya, you're not just a listener – you're a catalyst for change. Your daily 5-minute interactions create safe spaces where children can express themselves freely, building confidence and emotional intelligence.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Every conversation you have helps shape a child's future, making them more confident, expressive, and emotionally aware.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="text-gray-700 italic text-lg">
                  "Being an Observer has been the most rewarding experience of my career. Watching children open up and grow is priceless."
                </p>
                <p className="text-gray-800 font-semibold mt-4">— Current Observer</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">500+</div>
                  <div className="text-gray-600">Children Helped</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-purple-500 mb-2">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 hover:border-green-400 transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">50+</div>
                  <div className="text-gray-600">Active Observers</div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 hover:border-orange-400 transition-all transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">4.9/5</div>
                  <div className="text-gray-600">Observer Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Responsibilities Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">Your Responsibilities</h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            What you'll do as an Observer at Sanjaya
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {responsibilities.map((responsibility, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-4">
                    <responsibility.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{responsibility.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{responsibility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & Qualifications Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-2 border-green-200">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Benefits</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <span className="text-lg text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-purple-200">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Qualifications</h3>
                <ul className="space-y-4">
                  {qualifications.map((qualification, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                      <span className="text-lg text-gray-700">{qualification}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">Application Process</h2>
          <div className="space-y-8">
            {[
              { step: 1, title: 'Submit Application', description: 'Fill out our comprehensive application form with your background and motivation.' },
              { step: 2, title: 'Initial Screening', description: 'Our team reviews your application and credentials.' },
              { step: 3, title: 'Interview', description: 'Meet with our principals to discuss your role and expectations.' },
              { step: 4, title: 'Training Program', description: 'Complete our comprehensive training on child psychology and observation techniques.' },
              { step: 5, title: 'Start Making Impact', description: 'Begin your journey as an Observer and transform lives.' }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-102">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
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

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-100 via-blue-50 to-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our team of compassionate observers and help shape the future of children's emotional development.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-12 py-6 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
            Apply to Become an Observer
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ObserverLanding;