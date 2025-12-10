import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Shield, Clock, Heart, Star, ArrowRight, MessageCircle, CheckCircle, Sparkles, Phone, Calendar, TrendingUp, Zap } from 'lucide-react';
import ChatWidget from '../components/ChatWidget';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const Home = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const features = [
    {
      icon: Heart,
      title: 'Matched with a Caring Observer',
      description: 'Every child is thoughtfully paired with a warm, understanding observer who patiently listens.'
    },
    {
      icon: Clock,
      title: 'A Daily 5 Minute Sharing Time',
      description: 'Just five minutes a day to share stories, daily activities, dreams, or simply feelings.'
    },
    {
      icon: Sparkles,
      title: 'Encouragement & Guidance',
      description: 'Observers listen with care, celebrate little wins, and note progress that matters.'
    },
    {
      icon: Users,
      title: 'Growth Updates for Parents',
      description: 'Parents receive simple, easy-to-read reports highlighting their child\'s progress.'
    },
    {
      icon: Star,
      title: 'Journey to Confidence',
      description: 'With time, children blossom – becoming more expressive, confident, and joyful.'
    },
    {
      icon: Shield,
      title: 'Secure & Regulated',
      description: 'All sessions are recorded and stored securely as per regulations, ensuring safety and accountability.'
    }
  ];

  const automationFeatures = [
    {
      icon: Phone,
      title: 'Automated Calling System',
      description: 'Smart scheduling ensures timely, consistent observer-child interactions.'
    },
    {
      icon: Calendar,
      title: 'Call Scheduling System',
      description: 'Intelligent scheduling adapts to each child\'s routine and availability.'
    },
    {
      icon: Zap,
      title: 'Streamlined Onboarding',
      description: 'Automated onboarding process makes enrollment quick and simple for families.'
    },
    {
      icon: TrendingUp,
      title: 'AI-Powered Insights',
      description: 'Session metadata automation and trend generation provide deeper understanding of each child\'s development.'
    }
  ];

  const testimonials = [
    {
      name: 'Mr. Shah',
      role: 'Parent',
      text: 'I am very happy with this programme as I can see a remarkable change in my child. She was an introvert but now she is opening up and is more confident.'
    },
    {
      name: 'Mrs. Dsouza',
      role: 'Parent',
      text: 'After going through the growth reports I have realized that my child\'s study habits and social interactions are very positive. The reports are helping me to guide him in the right direction.'
    },
    {
      name: 'Daivik',
      role: 'Student, 16 years',
      text: 'This platform allows me to share my views and ideas freely. It helps me express positive thoughts and open up about negative ones.'
    },
    {
      name: 'Ovi',
      role: 'Student, 6 years',
      text: 'I am happy because I get a chance to talk, share, narrate stories and recite poems daily.'
    }
  ];

  const howItWorks = [
    { step: 1, title: 'Principals Nominate & Train Observers' },
    { step: 2, title: 'Automated Call Scheduling' },
    { step: 3, title: 'Observer Calls Child & Listens' },
    { step: 4, title: 'Sessions Recorded (Per Regulations)' },
    { step: 5, title: 'AI Captures Cues & Metadata' },
    { step: 6, title: 'AI Highlights Trends & Patterns' },
    { step: 7, title: 'Principal Reviews Performance' },
    { step: 8, title: 'Principal Guides Parents' },
    { step: 9, title: 'The Child Develops Soft Skills' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-8 animate-bounce-slow">
            <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="text-2xl">🎪</span>
            </div>
            <div className="w-12 h-12 bg-pink-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="text-2xl">🎭</span>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
              <span className="text-2xl">🎈</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Sanjaya – The Observer
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Every child needs someone who truly listens.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white border-2 border-indigo-300 hover:bg-indigo-50 transition-colors">
              <Users className="w-5 h-5 mr-2" />
              Trusted by 100+ Parents
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white border-2 border-purple-300 hover:bg-purple-50 transition-colors">
              <CheckCircle className="w-5 h-5 mr-2" />
              Endorsed by Principals
            </Badge>
            <Badge variant="secondary" className="px-6 py-3 text-lg bg-white border-2 border-blue-300 hover:bg-blue-50 transition-colors">
              <Shield className="w-5 h-5 mr-2" />
              Secure & Regulated
            </Badge>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              Get Started for Your Child
              <ArrowRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 px-8 py-6 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-indigo-600 mb-2">100+</div>
              <div className="text-gray-600">Happy Parents</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Children Helped</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Trained Observers</div>
            </div>
            <div className="transform hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-pink-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Founder</h2>
              <p className="text-lg text-gray-600 mb-6">
                With years of experience in child psychology and education, Punam Ma'am, as Principal, brings a unique blend of empathy and expertise to every interaction. Her gentle approach and profound understanding of children's needs make her the ideal guide for your child's educational journey.
              </p>
              <div className="bg-indigo-100 border-l-4 border-indigo-600 p-6 rounded-r-lg">
                <p className="text-gray-700 italic text-lg">
                  "Every child has a story to tell. My role is simply to listen, understand, and help parents see the beautiful complexity of their child's world."
                </p>
                <p className="text-gray-800 font-semibold mt-4">— Punam Jaiswal</p>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-80 h-80 rounded-full overflow-hidden shadow-2xl ring-8 ring-indigo-200">
                <img 
                  src="/images/punam-jaiswal.jpg" 
                  alt="Punam Jaiswal - Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">FEATURES</h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Our comprehensive approach ensures every child receives the care and attention they deserve
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-indigo-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Future Automation Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">NEXT-GENERATION AUTOMATION</h2>
          <p className="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            We're building advanced systems to enhance efficiency, reduce manpower needs, and strengthen privacy protection
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {automationFeatures.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">HOW IT WORKS</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-blue-400 hidden md:block"></div>
            {howItWorks.map((item, index) => (
              <div key={index} className={`flex items-center mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <Card className="inline-block border-2 border-indigo-200 hover:border-indigo-400 transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <p className="text-lg font-medium text-gray-700">{item.title}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10 flex-shrink-0 mx-4 md:mx-0">
                  {item.step}
                </div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-4">Hear From Our Community</h2>
          <p className="text-center text-xl text-gray-600 mb-16">Real stories from parents and students who've experienced transformation</p>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-xl transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-indigo-300 rounded-full flex items-center justify-center">
                      <span className="text-xl">{testimonial.role.includes('Parent') ? '👨' : '👧'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            No advice. No analysis. Just awareness.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            When someone truly listens, clarity follows. And children flourish.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-12 py-6 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all">
            Start Your Child's Journey Today
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Why Trust Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-16">Why Parents Trust Sanjaya</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Expert Guidance</h3>
              <p className="text-gray-600 text-lg">Supervised by legendary educators</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Secure & Regulated</h3>
              <p className="text-gray-600 text-lg">Recordings stored securely per regulations</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Daily Insights</h3>
              <p className="text-gray-600 text-lg">Confidential reports delivered daily</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all z-50"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default Home;