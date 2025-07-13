import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Play, 
  Download, 
  Share2, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Video,
  User,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import videoService from '../services/videoService';
import authService from '../services/authService';
import userService from '../services/userService';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadVideos();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, searchTerm, selectedLanguage, selectedDifficulty, sortBy]);

  const loadVideos = async () => {
    try {
      console.log('🔄 开始加载用户视频...')
      setLoading(true);
      setError('');
      
      const result = await userService.getUserVideos();
      console.log('📊 getUserVideos结果:', result)
      
      if (result.success) {
        console.log('✅ 成功加载视频，数量:', result.data?.length || 0)
        setVideos(result.data || []);
      } else {
        console.error('❌ 加载视频失败:', result.error)
        setError(result.error || 'Failed to load videos');
      }
    } catch (err) {
      console.error('❌ loadVideos异常:', err)
      setError('Failed to load videos. Please try again.');
    } finally {
      console.log('🏁 loadVideos完成，设置loading为false')
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📈 开始加载用户统计...')
      const result = await userService.getUserStats();
      console.log('📊 getUserStats结果:', result)
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('❌ 加载统计失败:', result.error)
      }
    } catch (err) {
      console.error('❌ loadStats异常:', err)
    }
  };

  const applyFilters = () => {
    let filtered = [...videos];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.math_topics && video.math_topics.some(topic => 
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Apply language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(video => video.language === selectedLanguage);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(video => video.difficulty_level === selectedDifficulty);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'duration':
        filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredVideos(filtered);
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      setIsDeleting(true);
      const result = await userService.deleteVideo(videoId);
      
      if (result.success) {
        setVideos(videos.filter(video => video.id !== videoId));
        setShowDeleteConfirm(null);
        // Refresh stats
        loadStats();
      } else {
        setError(result.error || 'Failed to delete video');
      }
    } catch (err) {
      setError('Failed to delete video. Please try again.');
      console.error('Error deleting video:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareVideo = async (videoId) => {
    try {
      const result = await videoService.generateShareLink(videoId);
      
      if (result.success) {
        if (navigator.share) {
          await navigator.share({
            title: 'AI Math Teaching Video',
            text: 'Check out this AI-generated math teaching video!',
            url: result.shareUrl
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(result.shareUrl);
          alert('Share link copied to clipboard!');
        }
      } else {
        setError(result.error || 'Failed to generate share link');
      }
    } catch (err) {
      setError('Failed to share video. Please try again.');
      console.error('Error sharing video:', err);
    }
  };

  const handleDownloadVideo = (video) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = video.video_url;
    link.download = `${video.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageFlag = (language) => {
    switch (language) {
      case 'zh': return '🇨🇳';
      case 'en': return '🇺🇸';
      default: return '🌐';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
          <p className="text-gray-600 mt-1">Manage your AI-generated math teaching videos</p>
        </div>
        <Button onClick={loadVideos} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalVideos}</p>
                </div>
                <Video className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.keys(stats.topicCounts || {}).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.videosThisWeek}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.videosThisMonth}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Language</Label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Languages</option>
                <option value="zh">🇨🇳 Chinese</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <Label>Sort By</Label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">Duration</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div>
              <Label>View</Label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Grid/List */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">
              {videos.length === 0 
                ? "You haven't created any videos yet. Start by generating your first AI math teaching video!"
                : "No videos match your current filters. Try adjusting your search criteria."
              }
            </p>
            {videos.length === 0 && (
              <Button onClick={() => window.location.href = '/'}>
                Create Your First Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredVideos.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {video.question}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-lg">{getLanguageFlag(video.language)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(video.difficulty_level)}>
                      {video.difficulty_level || 'intermediate'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(video.created_at)}
                  </span>
                </div>

                {video.math_topics && video.math_topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.math_topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {video.math_topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{video.math_topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.open(video.video_url, '_blank')}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadVideo(video)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShareVideo(video.id)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(video.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Video</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this video? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteVideo(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyVideos