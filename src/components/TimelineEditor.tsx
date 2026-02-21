import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Play, Pause, Trash2, GripVertical, Scissors, Video } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SourceVideo, TimelineSegment } from '@/types/video';

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
  const [videoDuration, setVideoDuration] = useState(0);

  // Auto-select first source video when added
  useEffect(() => {
    if (sourceVideos.length > 0 && !selectedSource) {
      setSelectedSource(sourceVideos[0]);
    }
  }, [sourceVideos, selectedSource]);

  useEffect(() => {
    if (selectedSource && videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [selectedSource]);

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
  const maxDuration = videoDuration || selectedSource?.duration || 100;

  // Show empty state when no source videos
  if (sourceVideos.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md border-dashed">
          <CardContent className="py-12 px-8 text-center">
            <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Source Videos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Click the <strong>+ button</strong> above to browse and add Nostr videos to your timeline
            </p>
            <Button onClick={onAddSourceVideo} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Video
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-[auto_1fr_auto] gap-4">
      {/* Source Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Source Videos ({sourceVideos.length})</span>
            <Button onClick={onAddSourceVideo} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add More
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-32">
            <div className="flex gap-2 flex-wrap pr-4">
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
                    <div className="h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{video.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {video.duration > 0 ? `${video.duration.toFixed(1)}s` : 'Loading...'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSourceVideo(video.id);
                        if (selectedSource?.id === video.id) {
                          setSelectedSource(sourceVideos[0] === video ? null : sourceVideos[0]);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Segment Creator */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedSource ? (
              <>✂️ Create Segment from: {selectedSource.name}</>
            ) : (
              <>Select a Source Video</>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSource ? (
            <>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  src={selectedSource.url}
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

              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>Current: {currentTime.toFixed(2)}s</span>
                  <span>Duration: {maxDuration.toFixed(2)}s</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-center">
                    Drag the slider to select your segment range:
                  </div>
                  <Slider
                    min={0}
                    max={maxDuration}
                    step={0.1}
                    value={range}
                    onValueChange={(value) => setRange(value as [number, number])}
                    className="w-full py-4"
                  />
                  <div className="text-center">
                    <span className="text-lg font-bold text-primary">
                      {range[0].toFixed(2)}s - {range[1].toFixed(2)}s
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({(range[1] - range[0]).toFixed(2)}s segment)
                    </span>
                  </div>
                </div>
              </div>

              <Button onClick={handleAddSegment} className="w-full" size="lg">
                <Scissors className="h-4 w-4 mr-2" />
                Cut This Segment & Add to Timeline
              </Button>
            </>
          ) : (
            <div className="aspect-video flex items-center justify-center text-muted-foreground text-center p-8">
              👆 Click a source video above to create segments from it
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>📽️ Timeline</span>
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
                <p className="mb-2">Your timeline is empty</p>
                <p className="text-sm">
                  Cut segments from source videos above to build your remix
                </p>
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
