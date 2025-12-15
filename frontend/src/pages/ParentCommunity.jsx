import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { ArrowLeft, MessageSquare, ThumbsUp, Send, Plus } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: 'all', label: 'All Topics', icon: '📋' },
  { value: 'emotional_support', label: 'Emotional Support', icon: '💙' },
  { value: 'school_issues', label: 'School Issues', icon: '🏫' },
  { value: 'activities', label: 'Activities', icon: '🎨' },
  { value: 'general', label: 'General', icon: '💬' }
];

const ParentCommunity = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  // New post form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    loadPosts();
  }, [navigate, category]);

  const loadPosts = async () => {
    try {
      const url = category === 'all' 
        ? `${BACKEND_URL}/api/forum/posts`
        : `${BACKEND_URL}/api/forum/posts?category=${category}`;
      
      const response = await axios.get(url, getAuthHeaders());
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/posts`,
        null,
        {
          ...getAuthHeaders(),
          params: {
            category: newPostCategory,
            title: newPostTitle,
            content: newPostContent
          }
        }
      );

      setShowNewPost(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/forum/posts/${postId}/comments`,
        getAuthHeaders()
      );
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/posts/${selectedPost.id}/comments`,
        null,
        {
          ...getAuthHeaders(),
          params: { content: newComment }
        }
      );

      setNewComment('');
      loadComments(selectedPost.id);
      loadPosts(); // Refresh to update comment count
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const toggleLike = async (targetId, targetType) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/forum/like`,
        null,
        {
          ...getAuthHeaders(),
          params: { target_id: targetId, target_type: targetType }
        }
      );
      
      if (targetType === 'post') {
        loadPosts();
      } else {
        loadComments(selectedPost.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const viewPost = (post) => {
    setSelectedPost(post);
    loadComments(post.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/parent/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Parent Community</h1>
            </div>
            <Button onClick={() => setShowNewPost(true)} className="bg-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                variant={category === cat.value ? 'default' : 'outline'}
                className={`whitespace-nowrap ${category === cat.value ? 'bg-blue-500' : ''}`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </Button>
            ))}
          </div>

          {/* New Post Modal */}
          {showNewPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNewPost(false)}>
              <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Create New Post (Anonymous)</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        placeholder="What's on your mind?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <Textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your thoughts, questions, or experiences..."
                        rows={6}
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      📌 Your post will be published anonymously as "Anonymous Parent"
                    </p>

                    <div className="flex gap-2">
                      <Button onClick={createPost} className="flex-1 bg-blue-500">
                        Post Anonymously
                      </Button>
                      <Button onClick={() => setShowNewPost(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Post View Modal */}
          {selectedPost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => setSelectedPost(null)}>
              <Card className="max-w-3xl w-full my-8" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-6">
                  <Button onClick={() => setSelectedPost(null)} variant="outline" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Posts
                  </Button>

                  {/* Post Content */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      By Anonymous Parent • {new Date(selectedPost.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                    
                    <div className="flex gap-4 mt-4">
                      <Button
                        onClick={() => toggleLike(selectedPost.id, 'post')}
                        variant="outline"
                        size="sm"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {selectedPost.likes_count}
                      </Button>
                      <span className="flex items-center text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {comments.length} comments
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-4">Comments</h3>
                    
                    <div className="space-y-4 mb-4">
                      {comments.map((comment) => (
                        <Card key={comment.id} className="bg-gray-50">
                          <CardContent className="p-4">
                            <p className="text-sm font-semibold mb-1">Anonymous Parent</p>
                            <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Button
                                onClick={() => toggleLike(comment.id, 'comment')}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {comment.likes_count}
                              </Button>
                              <span>{new Date(comment.created_at).toLocaleTimeString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment (posted anonymously)..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        onClick={addComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-500"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No posts yet in this category</p>
                <Button onClick={() => setShowNewPost(true)} className="mt-4 bg-blue-500">
                  Be the first to post!
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewPost(post)}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.comments_count}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentCommunity;
