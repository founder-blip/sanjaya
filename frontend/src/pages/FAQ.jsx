import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-all">
      <CardContent className="p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-left"
        >
          <h3 className="text-lg md:text-xl font-bold text-gray-900 pr-4">{question}</h3>
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-blue-600 flex-shrink-0" />
          )}
        </button>
        {isOpen && (
          <div className="mt-4 text-gray-700 text-lg leading-relaxed">
            {answer}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FAQ = () => {
  const [content, setContent] = useState({
    hero_title: 'Frequently Asked Questions',
    hero_description: 'Clear answers to common questions about Sanjaya.',
    faqs: [],
    cta_title: 'Still Have Questions?',
    cta_description: 'We\'re here to help. Reach out anytime.'
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/content/faq`);
        if (response.data && Object.keys(response.data).length > 0) {
          setContent(response.data);
        }
      } catch (error) {
        console.error('Error loading FAQ content:', error);
      }
    };
    loadContent();
  }, []);

  const faqs = content.faqs.length > 0 ? content.faqs : [
    {
      question: "Is this therapy or counseling?",
      answer: "No. Sanjaya is not therapy, counseling, or clinical treatment. We provide gentle emotional support through daily check-ins. Observers are trained listeners, not therapists. If your child needs professional mental health care, please consult a licensed professional."
    },
    {
      question: "Is data recorded?",
      answer: "Yes. All sessions are recorded and stored securely per regulatory requirements. This ensures safety, accountability, and quality. Recordings are encrypted and accessible only to authorized personnel. They help principals supervise observers and identify patterns for parent reports."
    },
    {
      question: "How are parents informed?",
      answer: "Parents receive regular summaries about their child's emotional patterns. These reports are reviewed by principals and focus on overall wellbeing trends, not word-for-word transcripts. You'll get easy-to-read insights delivered securely through our system."
    },
    {
      question: "Who has access to my child's data?",
      answer: "Only authorized personnel have access: the assigned observer, supervising principal, and you (the parent). Data is encrypted, stored securely, and never shared with third parties without your explicit consent. Your child's privacy is paramount."
    },
    {
      question: "Can I withdraw my child from the program?",
      answer: "Absolutely. You can withdraw consent and stop the program at any time, no questions asked. Your participation is completely voluntary."
    },
    {
      question: "What if my child doesn't want to talk?",
      answer: "That's perfectly fine. There's no pressure. Children can share as much or as little as they're comfortable with. Some days they might talk a lot, other days very little. Observers are trained to be patient and supportive."
    },
    {
      question: "What age group is Sanjaya for?",
      answer: "Sanjaya is designed for school-going children ages 5-18. The approach is gentle and age-appropriate, adapting to each child's developmental stage."
    },
    {
      question: "How long is each check-in?",
      answer: "Just 5 minutes. We keep it brief to fit naturally into a child's day without feeling overwhelming or intrusive."
    },
    {
      question: "What happens in an emergency?",
      answer: "Sanjaya is not a crisis intervention service. If an observer notices signs of immediate risk or harm, parents and appropriate authorities are notified immediately according to safety protocols."
    },
    {
      question: "How does AI work in Sanjaya?",
      answer: "AI helps identify emotional patterns from structured data over time. It never talks to children, never makes decisions, and never replaces human judgment. Think of it as a helpful tool for spotting trends that humans might miss."
    },
    {
      question: "Do observers diagnose conditions?",
      answer: "No. Observers are not medical professionals. They don't diagnose, prescribe treatment, or provide clinical advice. They simply listen and note patterns to help parents understand their child's emotional world."
    },
    {
      question: "Is parent consent required?",
      answer: "Yes, absolutely. Your explicit consent is mandatory before your child can participate. We take parental authority and family privacy very seriously."
    },
    {
      question: "Can I see the recordings?",
      answer: "Access to recordings is governed by our privacy policy and regulations. Generally, parents receive summaries rather than raw recordings to protect the child's sense of safety and confidentiality. Special requests can be discussed with principals."
    },
    {
      question: "What if I have concerns about my child's observer?",
      answer: "Please reach out immediately. All observers are supervised by principals. If you have any concerns, we'll address them promptly and can reassign a different observer if needed."
    },
    {
      question: "How much does Sanjaya cost?",
      answer: "Pricing varies by school and implementation. Please contact us or speak with your school principal for specific information about enrollment in your child's school."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.hero_title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {content.hero_description}
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Still Have Questions Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {content.cta_title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {content.cta_description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@sanjaya.com"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg transition-colors"
            >
              Email Us
            </a>
            <a
              href="tel:+1234567890"
              className="inline-block border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-full transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;