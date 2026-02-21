import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Play, Pause, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useShortFormVideos } from '@/hooks/useShortFormVideos';
import { formatDistanceToNow } from 'date-fns';
import type { Video } from '@/types/video';

interface VideoPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectVideo: (video: Video) => void;
}

export function VideoPickerModal({
  open,
  onClose,
  onSelectVideo,
}: VideoPickerModalProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: videos = [], isLoading } = useShortFormVideos(searchQuery);

  useEffect(() => {
    if (!open) {
      setPreviewVideo(null);
      setIsPlaying(false);
      setSearchInput('');
      setSearchQuery('');
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const handlePreview = (video: Video) => {
    setPreviewVideo(video);
    setIsPlaying(false);
  };

  const handleBackToGrid = () => {
    setPreviewVideo(null);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSelect = () => {
    if (previewVideo) {
      onSelectVideo(previewVideo);
      onClose();
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0" hideClose>
        {!previewVideo && (
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">Browse Nostr Videos</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {videos.length} videos available
                </p>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos on Nostr..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </DialogHeader>
        )}

        <div className="flex-1 overflow-hidden">
          {previewVideo ? (
            // Preview Mode
            <div className="h-full flex flex-col bg-black">
              {/* Top Bar */}
              <div className="bg-black/90 backdrop-blur p-4 border-b border-white/10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGrid}
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Grid
                </Button>
                <Button
                  onClick={handleSelect}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add to Timeline
                </Button>
              </div>

              {/* Video Container */}
              <div className="flex-1 flex items-center justify-center p-8 min-h-0">
                <div className="relative max-w-2xl max-h-full">
                  <video
                    ref={videoRef}
                    src={previewVideo.url}
                    className="max-w-full max-h-[calc(90vh-200px)] rounded-lg"
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="rounded-full h-16 w-16 pointer-events-auto"
                      variant="secondary"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <Play className="h-8 w-8" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="bg-black/90 backdrop-blur p-6 border-t border-white/10">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {previewVideo.name}
                  </h3>
                  <div className="space-y-1 text-sm text-white/70">
                    {previewVideo.duration > 0 && (
                      <p>Duration: {previewVideo.duration.toFixed(1)}s</p>
                    )}
                    <p>Published: {formatDate(previewVideo.publishedAt)}</p>
                    <p className="font-mono text-xs">
                      Author: {previewVideo.pubkey.slice(0, 16)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Grid Mode
            <div className="h-full overflow-y-auto px-6 py-4">
              {isLoading && !videos.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="aspect-[9/16] w-full rounded-t" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : videos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {searchQuery ? 'No videos found for your search' : 'No videos available'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-4">
                  {videos.map((video) => (
                    <Card
                      key={video.id}
                      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
                      onClick={() => handlePreview(video)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-[9/16] bg-muted overflow-hidden rounded-t">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                          {video.duration > 0 && (
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {video.duration.toFixed(0)}s
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm truncate mb-1">
                            {video.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDate(video.publishedAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
