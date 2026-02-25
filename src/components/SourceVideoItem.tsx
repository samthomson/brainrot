import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Trash2, Copy, GripVertical } from 'lucide-react';
import type { SourceVideo, TimelineSegment } from '@/types/video';

interface SourceVideoItemProps {
  video: SourceVideo;
  segmentId: string;
  index: number;
  onRemove: (segmentId: string) => void;
  onDuplicate: (video: SourceVideo) => void;
  onSegmentChange: (segmentId: string, segment: Omit<TimelineSegment, 'id' | 'order'>) => void;
}

export function SourceVideoItem({ video, segmentId, index, onRemove, onDuplicate, onSegmentChange }: SourceVideoItemProps) {
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

  // Auto-update timeline when range changes
  useEffect(() => {
    onSegmentChange(segmentId, {
      sourceVideoId: video.id,
      videoName: video.name,
      videoEventId: video.event.id,
      startTime: range[0],
      endTime: range[1],
      duration: range[1] - range[0],
    });
  }, [range, video, segmentId, onSegmentChange]);

  const maxDuration = videoDuration || video.duration || 100;

  return (
    <Card className="group">
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          {/* Drag Handle */}
          <div className="flex items-center pt-2 cursor-move">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Left: Thumbnail */}
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 bg-black rounded-lg overflow-hidden">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-2 text-sm font-medium truncate max-w-24">
              {video.name}
            </div>
          </div>

          {/* Right: Segment Creator */}
          <div className="flex-1 space-y-3">
            {/* Video Player - Smaller */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '200px' }}>
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
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <Button
                  onClick={togglePlayPause}
                  size="sm"
                  className="rounded-full h-10 w-10"
                  variant="secondary"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Segment Controls - Compact */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current: {currentTime.toFixed(2)}s</span>
                <span>Duration: {maxDuration.toFixed(2)}s</span>
              </div>

              <Slider
                min={0}
                max={maxDuration}
                step={0.1}
                value={range}
                onValueChange={(value) => setRange(value as [number, number])}
                className="w-full"
              />
              
              <div className="text-center">
                <span className="text-lg font-bold text-primary">
                  {range[0].toFixed(2)}s - {range[1].toFixed(2)}s
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({(range[1] - range[0]).toFixed(2)}s)
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDuplicate(video)}
              title="Duplicate segment"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(segmentId)}
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
