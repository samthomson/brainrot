import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Play, Pause, Trash2, GripVertical, Scissors } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SourceVideo, VideoSegment, TimelineSegment } from '@/types/video';

interface TimelineEditorProps {
  sourceVideos: SourceVideo[];
  onAddSourceVideo: () => void;
  onRemoveSourceVideo: (id: string) => void;
  timelineSegments: TimelineSegment[];
  onAddSegment: (segment: TimelineSegment) => void;
  onRemoveSegment: (id: string) => void;
  onReorderSegments: (fromIndex: number, toIndex: number) => void;
}

export function TimelineEditor({
  sourceVideos,
  onAddSourceVideo,
  onRemoveSourceVideo,
  timelineSegments,
  onAddSegment,
  onRemoveSegment,
  onReorderSegments,
}: TimelineEditorProps) {
  const [selectedSource, setSelectedSource] = useState<SourceVideo | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 5]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (selectedSource && videoRef.current) {
      videoRef.current.load();
      setRange([0, Math.min(5, selectedSource.duration || 5)]);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedSource]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

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
    if (!selectedSource) return;

    const segment: TimelineSegment = {
      id: crypto.randomUUID(),
      sourceVideoId: selectedSource.id,
      videoName: selectedSource.name,
      videoEventId: selectedSource.event.id,
      startTime: range[0],
      endTime: range[1],
      duration: range[1] - range[0],
      order: timelineSegments.length,
    };

    onAddSegment(segment);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== toIndex) {
      onReorderSegments(fromIndex, toIndex);
    }
  };

  const totalDuration = timelineSegments.reduce((sum, seg) => sum + seg.duration, 0);
  const maxDuration = selectedSource?.duration || 100;

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4">
      {/* Source Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Source Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {sourceVideos.map((video) => (
              <Card
                key={video.id}
                className={`cursor-pointer transition-all ${
                  selectedSource?.id === video.id
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setSelectedSource(video)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.name}
                      className="h-16 w-16 object-cover rounded"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{video.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.duration.toFixed(1)}s
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSourceVideo(video.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              onClick={onAddSourceVideo}
              className="h-24 w-32 border-dashed"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Segment Creator */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedSource ? 'Create Segment' : 'Select a Source Video'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSource ? (
            <>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  src={selectedSource.url}
                  className="w-full h-full"
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
                <Scissors className="h-4 w-4 mr-2" />
                Cut Segment & Add to Timeline
              </Button>
            </>
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted-foreground">
              Select a source video above to create segments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Timeline</span>
            {timelineSegments.length > 0 && (
              <span className="text-sm text-muted-foreground font-normal">
                Total: {totalDuration.toFixed(2)}s ({timelineSegments.length}{' '}
                segment{timelineSegments.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            {timelineSegments.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                Cut segments from source videos to build your remix
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {timelineSegments.map((segment, index) => (
                  <div
                    key={segment.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="group"
                  >
                    <Card className="cursor-move hover:border-primary transition-colors">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                          <span className="text-sm font-mono w-8">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">
                            {segment.videoName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {segment.startTime.toFixed(2)}s -{' '}
                            {segment.endTime.toFixed(2)}s (
                            {segment.duration.toFixed(2)}s)
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveSegment(segment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
