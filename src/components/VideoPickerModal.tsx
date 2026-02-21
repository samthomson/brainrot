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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Play, Pause, Check } from 'lucide-react';
import type { Video } from '@/types/video';

interface VideoPickerModalProps {
  open: boolean;
  onClose: () => void;
  videos: Video[];
  isLoading: boolean;
  onSelectVideo: (video: Video) => void;
}

export function VideoPickerModal({
  open,
  onClose,
  videos,
  isLoading,
  onSelectVideo,
}: VideoPickerModalProps) {
  const [search, setSearch] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) {
      setPreviewVideo(null);
      setIsPlaying(false);
      setSearch('');
    }
  }, [open]);

  const handlePreview = (video: Video) => {
    setPreviewVideo(video);
    setIsPlaying(false);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pick a Video from Nostr</DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
          {/* Left: Video List */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <Skeleton className="h-20 w-20 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {search ? 'No videos found' : 'No videos available'}
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {filteredVideos.map((video) => (
                    <Card
                      key={video.id}
                      className={`cursor-pointer transition-all ${
                        previewVideo?.id === video.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => handlePreview(video)}
                    >
                      <CardContent className="p-3 flex gap-3">
                        <div className="relative">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.name}
                              className="h-20 w-20 object-cover rounded"
                            />
                          ) : (
                            <div className="h-20 w-20 bg-muted rounded flex items-center justify-center">
                              <Play className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {previewVideo?.id === video.id && (
                            <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {video.name}
                          </p>
                          {video.duration > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {video.duration.toFixed(1)}s
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate">
                            {video.pubkey.slice(0, 8)}...
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col gap-3">
            {previewVideo ? (
              <>
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative flex-shrink-0">
                  <video
                    ref={videoRef}
                    src={previewVideo.url}
                    className="w-full h-full"
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="rounded-full"
                      variant="secondary"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold mb-2">{previewVideo.name}</h3>
                  {previewVideo.duration > 0 && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Duration: {previewVideo.duration.toFixed(1)}s
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Author: {previewVideo.pubkey.slice(0, 16)}...
                  </p>
                </div>

                <Button onClick={handleSelect} size="lg" className="w-full">
                  <Check className="h-4 w-4 mr-2" />
                  Add to Timeline
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Click a video to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
