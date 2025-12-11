import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { LogOut, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Content states
  const [heroContent, setHeroContent] = useState({
    main_tagline: '',
    sub_headline: '',
    description: '',
    cta_primary: '',
    cta_secondary: ''
  });

  const [founderContent, setFounderContent] = useState({
    name: '',
    title: '',
    description: '',
    quote: '',
    image_url: ''
  });

  const [whatIsSanjaya, setWhatIsSanjaya] = useState({
    heading: '',
    description: [],
    highlight_text: ''
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    } else {
      loadContent();
    }
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const loadContent = async () => {
    try {
      const [heroRes, founderRes, sanjayaRes, contactRes] = await Promise.all([
        axios.get(`${API}/admin/content/hero`, getAuthHeaders()),
        axios.get(`${API}/admin/content/founder`, getAuthHeaders()),
        axios.get(`${API}/admin/content/what-is-sanjaya`, getAuthHeaders()),
        axios.get(`${API}/admin/content/contact`, getAuthHeaders())
      ]);

      if (heroRes.data) setHeroContent(heroRes.data);
      if (founderRes.data) setFounderContent(founderRes.data);
      if (sanjayaRes.data) setWhatIsSanjaya(sanjayaRes.data);
      if (contactRes.data) setContactInfo(contactRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
      console.error('Error loading content:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  const saveHeroContent = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API}/admin/content/hero`, heroContent, getAuthHeaders());
      toast({ title: 'Success', description: 'Hero content updated successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update hero content', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFounderContent = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API}/admin/content/founder`, founderContent, getAuthHeaders());
      toast({ title: 'Success', description: 'Founder content updated successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update founder content', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveWhatIsSanjaya = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API}/admin/content/what-is-sanjaya`, whatIsSanjaya, getAuthHeaders());
      toast({ title: 'Success', description: 'What is Sanjaya content updated successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContactInfo = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API}/admin/content/contact`, contactInfo, getAuthHeaders());
      toast({ title: 'Success', description: 'Contact info updated successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update contact info', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sanjaya Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {localStorage.getItem('admin_username')}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadContent} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reload
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-8">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="founder">Founder</TabsTrigger>
            <TabsTrigger value="sanjaya">What is Sanjaya</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          {/* Hero Content Tab */}
          <TabsContent value="hero">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Hero Section</h2>
                
                <div>
                  <Label>Main Tagline</Label>
                  <Input
                    value={heroContent.main_tagline}
                    onChange={(e) => setHeroContent({...heroContent, main_tagline: e.target.value})}
                    placeholder="Nurturing Your Child's Emotional Voice"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Sub Headline</Label>
                  <Input
                    value={heroContent.sub_headline}
                    onChange={(e) => setHeroContent({...heroContent, sub_headline: e.target.value})}
                    placeholder="Daily Emotional Support Through Caring Conversations"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={heroContent.description}
                    onChange={(e) => setHeroContent({...heroContent, description: e.target.value})}
                    placeholder="Sanjaya connects your child..."
                    className="mt-2 h-32"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary CTA Button Text</Label>
                    <Input
                      value={heroContent.cta_primary}
                      onChange={(e) => setHeroContent({...heroContent, cta_primary: e.target.value})}
                      placeholder="Start Free Trial"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Secondary CTA Button Text</Label>
                    <Input
                      value={heroContent.cta_secondary}
                      onChange={(e) => setHeroContent({...heroContent, cta_secondary: e.target.value})}
                      placeholder="Watch How It Works"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={saveHeroContent}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Hero Content'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Founder Content Tab */}
          <TabsContent value="founder">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Founder Section</h2>
                
                <div>
                  <Label>Founder Name</Label>
                  <Input
                    value={founderContent.name}
                    onChange={(e) => setFounderContent({...founderContent, name: e.target.value})}
                    placeholder="Smt. Punam Jaiswal"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={founderContent.title}
                    onChange={(e) => setFounderContent({...founderContent, title: e.target.value})}
                    placeholder="Founder and Former Principal"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={founderContent.description}
                    onChange={(e) => setFounderContent({...founderContent, description: e.target.value})}
                    placeholder="With years of experience..."
                    className="mt-2 h-32"
                  />
                </div>

                <div>
                  <Label>Quote</Label>
                  <Textarea
                    value={founderContent.quote}
                    onChange={(e) => setFounderContent({...founderContent, quote: e.target.value})}
                    placeholder="Every child has a story to tell..."
                    className="mt-2 h-24"
                  />
                </div>

                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={founderContent.image_url}
                    onChange={(e) => setFounderContent({...founderContent, image_url: e.target.value})}
                    placeholder="/images/punam-jaiswal.jpg"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={saveFounderContent}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Founder Content'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* What is Sanjaya Tab */}
          <TabsContent value="sanjaya">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit What is Sanjaya Section</h2>
                
                <div>
                  <Label>Heading</Label>
                  <Input
                    value={whatIsSanjaya.heading}
                    onChange={(e) => setWhatIsSanjaya({...whatIsSanjaya, heading: e.target.value})}
                    placeholder="What is Sanjaya – The Observer?"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Description (One per line)</Label>
                  <Textarea
                    value={whatIsSanjaya.description?.join('\n') || ''}
                    onChange={(e) => setWhatIsSanjaya({...whatIsSanjaya, description: e.target.value.split('\n')})}
                    placeholder="Line 1\nLine 2\nLine 3"
                    className="mt-2 h-48"
                  />
                </div>

                <div>
                  <Label>Highlight Text</Label>
                  <Input
                    value={whatIsSanjaya.highlight_text}
                    onChange={(e) => setWhatIsSanjaya({...whatIsSanjaya, highlight_text: e.target.value})}
                    placeholder="India's first structured daily observation program..."
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={saveWhatIsSanjaya}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save What is Sanjaya Content'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Contact Information</h2>
                
                <div>
                  <Label>Email</Label>
                  <Input
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    placeholder="support@sanjaya.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                    placeholder="India"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={saveContactInfo}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Contact Info'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;