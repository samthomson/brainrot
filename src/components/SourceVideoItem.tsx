import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Trash2, Scissors } from 'lucide-react';
import type { SourceVideo, TimelineSegment } from '@/types/video';

interface SourceVideoItemProps {
  video: SourceVideo;
  onRemove: (id: string) => void;
  onAddSegment: (segment: TimelineSegment) => void;
}

export function SourceVideoItem({ video, onRemove, onAddSegment }: SourceVideoItemProps) {
  const [range, setRange] = useState<[number, number]>([0, 5]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setRange([0, Math.min(5, duration)]);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (isPlaying && time >= range[1]) {
        videoRef.current.currentTime = range[0];
      }
      if (time < range[0] || time > range[1]) {
        videoRef.current.currentTime = range[0];
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = range[0];
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (videoRef.current && !isPlaying) {
      if (currentTime < range[0] || currentTime > range[1]) {
        videoRef.current.currentTime = range[0];
      }
    }
  }, [range, currentTime, isPlaying]);

  const handleAddSegment = () => {
    const segment: TimelineSegment = {
      id: crypto.randomUUID(),
      sourceVideoId: video.id,
      videoName: video.name,
      videoEventId: video.event.id,
      startTime: range[0],
      endTime: range[1],
      duration: range[1] - range[0],
      order: 0, // Will be set by parent
    };

    onAddSegment(segment);
  };

  const maxDuration = videoDuration || video.duration || 100;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left: Thumbnail/Preview */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 bg-black rounded-lg overflow-hidden">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm font-medium truncate flex-1">{video.name}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRemove(video.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Segment Creator */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Create Segment from: {video.name}
              </h3>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative max-w-2xl">
              <video
                ref={videoRef}
                src={video.url}
                className="w-full h-full object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                playsInline
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="rounded-full"
                  variant="secondary"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Segment Controls */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span>Current: {currentTime.toFixed(2)}s</span>
                <span>Duration: {maxDuration.toFixed(2)}s</span>
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold mb-2">
                  Drag the slider to select your segment range:
                </p>
                <Slider
                  min={0}
                  max={maxDuration}
                  step={0.1}
                  value={range}
                  onValueChange={(value) => setRange(value as [number, number])}
                  className="w-full py-4"
                />
                <div className="mt-2">
                  <span className="text-2xl font-bold text-primary">
                    {range[0].toFixed(2)}s - {range[1].toFixed(2)}s
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({(range[1] - range[0]).toFixed(2)}s segment)
                  </span>
                </div>
              </div>

              <Button onClick={handleAddSegment} className="w-full" size="lg">
                <Scissors className="h-4 w-4 mr-2" />
                Cut This Segment & Add to Timeline
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
