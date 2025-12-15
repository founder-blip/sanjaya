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
import InquiriesManager from '../components/InquiriesManager';
import GuardianManager from '../components/GuardianManager';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [activeTab, setActiveTab] = useState('hero');
  const [inquiries, setInquiries] = useState([]);

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

  useEffect(() => {
    if (selectedPage === 'inquiries') {
      loadInquiries();
    }
  }, [selectedPage]);

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

  const loadInquiries = async () => {
    try {
      const response = await axios.get(`${API}/admin/inquiries`, getAuthHeaders());
      if (response.data) {
        setInquiries(response.data.inquiries || []);
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
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
      toast({ 
        title: '✅ Changes Saved!', 
        description: 'Click "View Changes (No Cache)" button to see updates on public site',
        duration: 5000
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update hero content', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const openPublicSiteWithCacheBust = () => {
    // Open public site with timestamp to bypass cache
    const timestamp = new Date().getTime();
    window.open(`/?v=${timestamp}`, '_blank');
  };

  const saveFounderContent = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${API}/admin/content/founder`, founderContent, getAuthHeaders());
      toast({ 
        title: '✅ Changes Saved!', 
        description: 'Click "View Changes (No Cache)" button to see updates on public site',
        duration: 5000
      });
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
      toast({ 
        title: '✅ Changes Saved!', 
        description: 'Click "View Changes (No Cache)" button to see updates on public site',
        duration: 5000
      });
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
      toast({ 
        title: '✅ Changes Saved!', 
        description: 'Click "View Changes (No Cache)" button to see updates on public site',
        duration: 5000
      });
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
        {/* Page Selector */}
        <div className="mb-6">
          <Label className="text-lg font-semibold mb-2 block">Select Page to Edit</Label>
          <select
            value={selectedPage}
            onChange={(e) => {
              setSelectedPage(e.target.value);
              setActiveTab('hero');
            }}
            className="w-full max-w-md px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          >
            <option value="home">🏠 Homepage Content</option>
            <option value="about">ℹ️ About Page</option>
            <option value="faq">❓ FAQ Page</option>
            <option value="how-it-works">🔧 How It Works Page</option>
            <option value="observer">👁️ For Observers Page</option>
            <option value="principal">🏫 For Principals Page</option>
            <option value="get-started">🚀 Get Started Page</option>
            <option value="inquiries">📧 Form Inquiries</option>
            <option value="guardians">👨‍👩‍👧 Guardian Management</option>
          </select>
        </div>

        {/* Homepage Content */}
        {selectedPage === 'home' && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-8">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="founder">Founder</TabsTrigger>
            <TabsTrigger value="sanjaya">What is Sanjaya</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          {/* Hero Content Tab */}
          <TabsContent value="hero">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Edit Form */}
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

                <div className="pt-4 border-t">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Call-to-Action Buttons</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Label className="font-semibold text-orange-700">Primary CTA</Label>
                      <Input
                        value={heroContent.cta_primary}
                        onChange={(e) => setHeroContent({...heroContent, cta_primary: e.target.value})}
                        placeholder="Book a Free Consultation"
                        className="mt-2 mb-3"
                      />
                      <Label className="text-sm text-gray-600">Link URL</Label>
                      <Input
                        value={heroContent.cta_primary_link || '/get-started'}
                        onChange={(e) => setHeroContent({...heroContent, cta_primary_link: e.target.value})}
                        placeholder="/get-started"
                        className="mt-1"
                      />
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label className="font-semibold text-blue-700">Secondary CTA</Label>
                      <Input
                        value={heroContent.cta_secondary}
                        onChange={(e) => setHeroContent({...heroContent, cta_secondary: e.target.value})}
                        placeholder="Learn How It Works"
                        className="mt-2 mb-3"
                      />
                      <Label className="text-sm text-gray-600">Link URL</Label>
                      <Input
                        value={heroContent.cta_secondary_link || '/how-it-works'}
                        onChange={(e) => setHeroContent({...heroContent, cta_secondary_link: e.target.value})}
                        placeholder="/how-it-works"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={saveHeroContent}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 flex-1"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview Panel */}
            <Card className="lg:sticky lg:top-8 h-fit">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Live Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={openPublicSiteWithCacheBust}
                      className="bg-green-600 hover:bg-green-700 text-white gap-2"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      View Changes (No Cache)
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-block bg-orange-100 rounded-full px-4 py-1 text-sm text-orange-700 font-semibold">
                      🌟 Every Child Deserves to Be Heard
                    </span>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {heroContent.main_tagline || 'Main Tagline Here'}
                  </h1>
                  
                  <p className="text-xl text-gray-700 font-medium">
                    {heroContent.sub_headline || 'Sub Headline Here'}
                  </p>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {heroContent.description || 'Description text will appear here'}
                  </p>
                  
                  <div className="flex flex-col gap-2 pt-4">
                    <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                      {heroContent.cta_primary || 'Primary CTA'}
                    </Button>
                    <Button variant="outline" className="border-2 border-orange-500 text-orange-600">
                      {heroContent.cta_secondary || 'Secondary CTA'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Founder Content Tab */}
          <TabsContent value="founder">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2 w-full"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Founder Preview Panel */}
            <Card className="lg:sticky lg:top-8 h-fit">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>
                
                <div className="bg-white rounded-2xl p-6 border-2 border-orange-100">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-orange-200 bg-gray-200 flex items-center justify-center">
                      {founderContent.image_url ? (
                        <img src={founderContent.image_url} alt="Founder" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                    </div>
                    
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {founderContent.name || 'Founder Name'}
                      </p>
                      <p className="text-orange-600 font-semibold">
                        {founderContent.title || 'Title'}
                      </p>
                    </div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {founderContent.description || 'Description will appear here...'}
                    </p>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-4 rounded-r-lg w-full">
                      <p className="text-gray-700 italic text-sm">
                        "{founderContent.quote || 'Founder quote will appear here...'}"
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
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
        )}

        {/* Inquiries Management - Enhanced */}
        {selectedPage === 'inquiries' && (
          <InquiriesManager inquiries={inquiries} loadInquiries={loadInquiries} />
        )}

        {/* Other Pages - Simple JSON Editor for now */}
        {selectedPage !== 'home' && selectedPage !== 'inquiries' && (
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Edit {selectedPage.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Page
                </h2>
                <p className="text-gray-600">
                  Use the JSON editor below to modify page content. Changes will reflect immediately on the public page after saving.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> This page uses JSON format for editing. A visual editor will be added soon. 
                  Make sure to maintain the JSON structure when editing.
                </p>
              </div>

              <Textarea
                className="font-mono text-sm h-96 mb-4"
                placeholder="Loading content..."
                defaultValue="Content management for this page coming soon..."
              />

              <div className="flex gap-4">
                <Button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white gap-2"
                  disabled
                >
                  <Save className="w-4 h-4" />
                  Save Changes (Coming Soon)
                </Button>
                <Button
                  onClick={openPublicSiteWithCacheBust}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  View Page (No Cache)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;