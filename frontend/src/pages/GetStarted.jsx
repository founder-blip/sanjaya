import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GetStarted = () => {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    schoolName: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert to snake_case for backend
      const submissionData = {
        parent_name: formData.parentName,
        email: formData.email,
        phone: formData.phone,
        child_name: formData.childName,
        child_age: parseInt(formData.childAge),
        school_name: formData.schoolName,
        message: formData.message
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/inquiries`, submissionData);
      
      if (response.data.success) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Thank You!
            </h1>
            
            <p className="text-xl text-gray-700 mb-4">
              We've received your information and will contact you within 24 hours.
            </p>
            
            <p className="text-lg text-gray-600 mb-8">
              Our team is excited to help you get started with Sanjaya and support your child's emotional growth journey.
            </p>
            
            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-full shadow-lg"
            >
              Return to Homepage
            </Button>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get Started with Sanjaya
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Begin your journey towards better emotional support for your child. Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-orange-200 rounded-3xl shadow-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Request Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Parent Information */}
                <div className="bg-blue-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Parent Information</h3>
                  
                  <div>
                    <Label htmlFor="parentName">Your Name *</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Child Information */}
                <div className="bg-purple-50 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Child Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="childName">Child's Name *</Label>
                      <Input
                        id="childName"
                        name="childName"
                        value={formData.childName}
                        onChange={handleChange}
                        placeholder="Sarah Doe"
                        required
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="childAge">Child's Age *</Label>
                      <Input
                        id="childAge"
                        name="childAge"
                        type="number"
                        min="5"
                        max="18"
                        value={formData.childAge}
                        onChange={handleChange}
                        placeholder="10"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="Springfield Elementary"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <Label htmlFor="message">Additional Information or Questions</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your child or any specific concerns you have..."
                    className="mt-2 h-32"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-xl rounded-full shadow-xl transform hover:scale-105 transition-all"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    <ArrowRight className="ml-2" />
                  </Button>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose Sanjaya Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Why Families Choose Sanjaya
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Safe & Confidential',
                description: 'All sessions are private and secure with trained observers',
                icon: '🔒'
              },
              {
                title: 'Expert Guidance',
                description: 'Supervised by experienced principals and educators',
                icon: '👨‍🏫'
              },
              {
                title: 'Proven Results',
                description: '500+ children supported with 4.9/5 parent satisfaction',
                icon: '⭐'
              }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-blue-200 rounded-2xl hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GetStarted;
