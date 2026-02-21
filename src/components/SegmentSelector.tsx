import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Play, Pause } from 'lucide-react';
import type { Video, VideoSegment } from '@/types/video';

interface SegmentSelectorProps {
  video: Video | null;
  onAddSegment: (segment: VideoSegment) => void;
  onVideoDurationLoaded: (videoId: string, duration: number) => void;
}

export function SegmentSelector({
  video,
  onAddSegment,
  onVideoDurationLoaded,
}: SegmentSelectorProps) {
  const [range, setRange] = useState<[number, number]>([0, 5]);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.load();
      setRange([0, Math.min(5, video.duration || 5)]);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [video]);

  const handleLoadedMetadata = () => {
    if (videoRef.current && video) {
      const duration = videoRef.current.duration;
      onVideoDurationLoaded(video.id, duration);
      setRange([0, Math.min(5, duration)]);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Loop within selected range
      if (time >= range[1]) {
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

  const handleAddSegment = () => {
    if (!video) return;

    const segment: VideoSegment = {
      id: crypto.randomUUID(),
      videoId: video.id,
      videoName: video.name,
      videoEventId: video.event.id,
      startTime: range[0],
      endTime: range[1],
      duration: range[1] - range[0],
    };

    onAddSegment(segment);
  };

  if (!video) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Select a video from the library to create segments
        </CardContent>
      </Card>
    );
  }

  const maxDuration = video.duration || 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Segment Selector</CardTitle>
        <p className="text-sm text-muted-foreground truncate">{video.name}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
          <video
            ref={videoRef}
            src={video.url}
            className="w-full h-full"
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

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current: {currentTime.toFixed(2)}s</span>
              <span>Duration: {maxDuration.toFixed(2)}s</span>
            </div>
            <div className="text-sm font-medium">
              Selected: {range[0].toFixed(2)}s - {range[1].toFixed(2)}s
              <span className="text-muted-foreground ml-2">
                ({(range[1] - range[0]).toFixed(2)}s)
              </span>
            </div>
            <Slider
              min={0}
              max={maxDuration}
              step={0.1}
              value={range}
              onValueChange={(value) => setRange(value as [number, number])}
              className="w-full"
            />
          </div>

          <Button onClick={handleAddSegment} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add Segment to Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
