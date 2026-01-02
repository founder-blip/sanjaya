import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Mail, FolderOpen, Send, Inbox, FileText, Plus, Settings,
  CheckCircle, AlertCircle, Loader2, RefreshCw, Trash2,
  Upload, Share2, Download, ChevronRight, ArrowLeft, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminCommunications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [gmailStatus, setGmailStatus] = useState({ connected: false });
  const [driveStatus, setDriveStatus] = useState({ connected: false });
  const [emails, setEmails] = useState([]);
  const [files, setFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check for OAuth callbacks
    if (searchParams.get('gmail_connected')) {
      toast({ title: "Gmail Connected!", description: "Your Gmail account is now linked." });
    }
    if (searchParams.get('drive_connected')) {
      toast({ title: "Google Drive Connected!", description: "Your Drive is now linked." });
    }
    
    fetchStatus();
  }, [searchParams]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [gmailRes, driveRes, templatesRes] = await Promise.all([
        axios.get(`${API_URL}/api/google/gmail/status`),
        axios.get(`${API_URL}/api/google/drive/status`),
        axios.get(`${API_URL}/api/google/templates`)
      ]);
      
      setGmailStatus(gmailRes.data);
      setDriveStatus(driveRes.data);
      setTemplates(templatesRes.data.templates || []);
      
      if (gmailRes.data.connected) {
        fetchEmails();
      }
      if (driveRes.data.connected) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/google/gmail/inbox?max_results=20`);
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const fetchFiles = async (folderId = 'root') => {
    try {
      const response = await axios.get(`${API_URL}/api/google/drive/files?folder_id=${folderId}`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const connectGmail = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/google/gmail/connect?admin_token=admin`);
      window.location.href = response.data.authorization_url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to initiate Gmail connection", variant: "destructive" });
    }
  };

  const connectDrive = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/google/drive/connect?admin_token=admin`);
      window.location.href = response.data.authorization_url;
    } catch (error) {
      toast({ title: "Error", description: "Failed to initiate Drive connection", variant: "destructive" });
    }
  };

  const sendEmail = async () => {
    if (!composeData.to || !composeData.subject) {
      toast({ title: "Error", description: "Please fill in recipient and subject", variant: "destructive" });
      return;
    }
    
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/google/gmail/send`, null, {
        params: {
          to: composeData.to,
          subject: composeData.subject,
          body_html: composeData.body.replace(/\n/g, '<br>'),
          body_text: composeData.body
        }
      });
      
      toast({ title: "Email Sent!", description: `Email sent to ${composeData.to}` });
      setShowCompose(false);
      setComposeData({ to: '', subject: '', body: '' });
      fetchEmails();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const viewEmail = async (emailId) => {
    try {
      const response = await axios.get(`${API_URL}/api/google/gmail/message/${emailId}`);
      setSelectedEmail(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load email", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Communications Center</h1>
                <p className="text-sm text-gray-500">Manage Gmail & Google Drive integrations</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Connection Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Gmail Status */}
          <Card className={`border-2 ${gmailStatus.connected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${gmailStatus.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Mail className={`w-7 h-7 ${gmailStatus.connected ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Gmail</h3>
                    {gmailStatus.connected ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Connected as {gmailStatus.email}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                {!gmailStatus.connected && (
                  <Button onClick={connectGmail} className="bg-red-500 hover:bg-red-600">
                    Connect Gmail
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Drive Status */}
          <Card className={`border-2 ${driveStatus.connected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${driveStatus.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FolderOpen className={`w-7 h-7 ${driveStatus.connected ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Google Drive</h3>
                    {driveStatus.connected ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Connected
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Not connected</p>
                    )}
                  </div>
                </div>
                {!driveStatus.connected && (
                  <Button onClick={connectDrive} className="bg-blue-500 hover:bg-blue-600">
                    Connect Drive
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox, disabled: !gmailStatus.connected },
            { id: 'compose', label: 'Compose', icon: Send, disabled: !gmailStatus.connected },
            { id: 'templates', label: 'Templates', icon: FileText },
            { id: 'drive', label: 'Drive Files', icon: FolderOpen, disabled: !driveStatus.connected }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`rounded-b-none ${activeTab === tab.id ? 'bg-orange-500' : ''}`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'inbox' && gmailStatus.connected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inbox</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchEmails}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {emails.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No emails found</p>
                ) : (
                  <div className="space-y-2">
                    {emails.map(email => (
                      <div
                        key={email.id}
                        onClick={() => viewEmail(email.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${selectedEmail?.id === email.id ? 'bg-orange-50 border-l-4 border-orange-500' : 'border-l-4 border-transparent'}`}
                      >
                        <p className="font-medium text-sm truncate">{email.from}</p>
                        <p className="text-sm text-gray-900 truncate">{email.subject}</p>
                        <p className="text-xs text-gray-500 truncate">{email.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEmail ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{selectedEmail.from}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subject</p>
                      <p className="font-medium">{selectedEmail.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{selectedEmail.date}</p>
                    </div>
                    <div className="border-t pt-4">
                      <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} className="prose prose-sm max-w-none" />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setComposeData({ 
                          to: selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from,
                          subject: `Re: ${selectedEmail.subject}`,
                          body: ''
                        });
                        setActiveTab('compose');
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" /> Reply
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-16">Select an email to preview</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'compose' && gmailStatus.connected && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">To</label>
                <Input
                  type="email"
                  placeholder="recipient@example.com"
                  value={composeData.to}
                  onChange={e => setComposeData({...composeData, to: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={composeData.subject}
                  onChange={e => setComposeData({...composeData, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Use Template</label>
                <select
                  className="w-full border rounded-md p-2"
                  onChange={e => {
                    const tpl = templates.find(t => t.id === e.target.value);
                    if (tpl) {
                      setComposeData({
                        ...composeData,
                        subject: tpl.subject,
                        body: tpl.body_html.replace(/<[^>]*>/g, '')
                      });
                    }
                  }}
                >
                  <option value="">Select a template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  rows={10}
                  placeholder="Write your message..."
                  value={composeData.body}
                  onChange={e => setComposeData({...composeData, body: e.target.value})}
                />
              </div>
              <Button onClick={sendEmail} disabled={sending} className="w-full bg-orange-500 hover:bg-orange-600">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Email
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 line-clamp-3" dangerouslySetInnerHTML={{ __html: template.body_html }} />
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => {
                      setComposeData({
                        to: '',
                        subject: template.subject,
                        body: template.body_html.replace(/<[^>]*>/g, '')
                      });
                      setActiveTab('compose');
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'drive' && driveStatus.connected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Google Drive Files</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchFiles()}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No files found</p>
              ) : (
                <div className="space-y-2">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center gap-3">
                        {file.mimeType === 'application/vnd.google-apps.folder' ? (
                          <FolderOpen className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Folder'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {file.webViewLink && (
                          <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Not Connected Messages */}
        {activeTab === 'inbox' && !gmailStatus.connected && (
          <Card className="text-center py-16">
            <CardContent>
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gmail Not Connected</h3>
              <p className="text-gray-500 mb-4">Connect your Gmail account to view and send emails</p>
              <Button onClick={connectGmail} className="bg-red-500 hover:bg-red-600">
                Connect Gmail
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'drive' && !driveStatus.connected && (
          <Card className="text-center py-16">
            <CardContent>
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Google Drive Not Connected</h3>
              <p className="text-gray-500 mb-4">Connect your Google Drive to manage files</p>
              <Button onClick={connectDrive} className="bg-blue-500 hover:bg-blue-600">
                Connect Google Drive
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
