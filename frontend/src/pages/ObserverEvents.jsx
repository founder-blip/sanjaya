import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, Gift, PartyPopper, Heart, Send, Users, 
  ChevronRight, Clock, Sparkles, Star, ArrowLeft,
  Check, Loader2, Flag, Cake
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ObserverEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [todaysEvents, setTodaysEvents] = useState([]);
  const [wishHistory, setWishHistory] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const [upcomingRes, todayRes, historyRes] = await Promise.all([
        axios.get(`${API_URL}/api/events/upcoming?token=${token}&days=60`),
        axios.get(`${API_URL}/api/events/today?token=${token}`),
        axios.get(`${API_URL}/api/events/wish-history?token=${token}&limit=20`)
      ]);
      setUpcomingEvents(upcomingRes.data.upcoming_events || []);
      setTodaysEvents(todayRes.data.todays_events || []);
      setWishHistory([
        ...(historyRes.data.individual_wishes || []),
        ...(historyRes.data.batch_wishes || [])
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendWish = async (event) => {
    setSending(true);
    try {
      const token = localStorage.getItem('observer_token');
      const message = customMessage || event.default_wish;
      
      if (event.type === 'birthday') {
        await axios.post(`${API_URL}/api/events/wish?token=${token}`, null, {
          params: {
            event_type: 'birthday',
            'child_ids': event.child_id,
            message: message,
            event_name: event.name,
            event_date: event.date
          }
        });
      } else {
        await axios.post(`${API_URL}/api/events/wish-all?token=${token}`, null, {
          params: {
            event_type: event.event_type || 'national',
            message: message,
            event_name: event.name,
            event_date: event.date
          }
        });
      }
      
      toast({
        title: "Wish Sent! 🎉",
        description: event.type === 'birthday' 
          ? `Your birthday wish has been sent to ${event.child_name}!`
          : `Your wishes have been sent to all children!`
      });
      
      setSelectedEvent(null);
      setCustomMessage('');
      fetchData();
    } catch (error) {
      console.error('Error sending wish:', error);
      toast({
        title: "Error",
        description: "Failed to send wish",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/observer/dashboard')}
                className="hover:bg-orange-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PartyPopper className="w-7 h-7 text-orange-500" />
                  Events & Celebrations
                </h1>
                <p className="text-sm text-gray-500">Send wishes to your children on special occasions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Events Banner */}
        {todaysEvents.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-bold">Today's Celebrations!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-all"
                  onClick={() => {
                    setSelectedEvent(event);
                    setCustomMessage(event.default_wish);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{event.icon}</span>
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      {event.type === 'birthday' && (
                        <p className="text-sm text-white/80">Turning {event.age_turning} years old!</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['upcoming', 'history'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'bg-orange-500 hover:bg-orange-600' : ''}
            >
              {tab === 'upcoming' ? (
                <><Calendar className="w-4 h-4 mr-2" /> Upcoming Events</>
              ) : (
                <><Clock className="w-4 h-4 mr-2" /> Wish History</>
              )}
            </Button>
          ))}
        </div>

        {activeTab === 'upcoming' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Birthdays Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Cake className="w-5 h-5" /> Upcoming Birthdays
                </CardTitle>
                <CardDescription className="text-white/80">Children's birthdays in the next 60 days</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {upcomingEvents.filter(e => e.type === 'birthday').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming birthdays</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.filter(e => e.type === 'birthday').map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 cursor-pointer transition-all group"
                        onClick={() => {
                          setSelectedEvent(event);
                          setCustomMessage(event.default_wish);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
                            🎂
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.child_name}</h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.date)} • Turning {event.age_turning}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.days_until === 0 ? 'bg-green-100 text-green-700' :
                            event.days_until <= 7 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {event.days_until === 0 ? 'Today!' : 
                             event.days_until === 1 ? 'Tomorrow' :
                             `${event.days_until} days`}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* National Events Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" /> National Events & Festivals
                </CardTitle>
                <CardDescription className="text-white/80">Celebrations in the next 60 days</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {upcomingEvents.filter(e => e.type === 'national').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.filter(e => e.type === 'national').map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 cursor-pointer transition-all group"
                        onClick={() => {
                          setSelectedEvent(event);
                          setCustomMessage(event.default_wish);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                            {event.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.name}</h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.date)} • {event.children_count} children
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.days_until === 0 ? 'bg-green-100 text-green-700' :
                            event.days_until <= 7 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {event.days_until === 0 ? 'Today!' : 
                             event.days_until === 1 ? 'Tomorrow' :
                             `${event.days_until} days`}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Wish History */
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> Wishes Sent
              </CardTitle>
              <CardDescription>Your recent wishes to children</CardDescription>
            </CardHeader>
            <CardContent>
              {wishHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No wishes sent yet</p>
              ) : (
                <div className="space-y-4">
                  {wishHistory.map((wish) => (
                    <div key={wish.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{wish.event_name}</h4>
                          <p className="text-sm text-gray-500">
                            {wish.child_name ? `To: ${wish.child_name}` : `To: ${wish.children_count || 'All'} children`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(wish.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm bg-white p-3 rounded-lg">"{wish.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Send Wish Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">{selectedEvent.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedEvent.name}</h3>
                {selectedEvent.type === 'birthday' ? (
                  <p className="text-gray-500">Send a special birthday wish to {selectedEvent.child_name}</p>
                ) : (
                  <p className="text-gray-500">Send wishes to all your children</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full"
                  placeholder="Write your heartfelt message..."
                />
                <p className="text-xs text-gray-400 mt-1">Customize the message or use the suggested one</p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedEvent(null);
                    setCustomMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  onClick={() => handleSendWish(selectedEvent)}
                  disabled={sending || !customMessage.trim()}
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Wish</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
