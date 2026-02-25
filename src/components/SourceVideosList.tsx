import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';
import { SourceVideoItem } from '@/components/SourceVideoItem';
import type { SourceVideo, TimelineSegment } from '@/types/video';

interface SourceSegment {
  id: string;
  video: SourceVideo;
}

interface SourceVideosListProps {
  sourceSegments: SourceSegment[];
  onAddSourceVideo: () => void;
  onRemoveSegment: (segmentId: string) => void;
  onDuplicateVideo: (video: SourceVideo) => void;
  onSegmentChange: (segmentId: string, segment: Omit<TimelineSegment, 'id' | 'order'>) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function SourceVideosList({
  sourceSegments,
  onAddSourceVideo,
  onRemoveSegment,
  onDuplicateVideo,
  onSegmentChange,
  onReorder,
}: SourceVideosListProps) {
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);

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
      onReorder(fromIndex, toIndex);
    }
  };

  const handlePlayingChange = (segmentId: string, playing: boolean) => {
    if (playing) {
      setPlayingSegmentId(segmentId);
    } else if (playingSegmentId === segmentId) {
      setPlayingSegmentId(null);
    }
  };

  if (sourceSegments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Source Videos</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add videos from Nostr to start creating your remix
          </p>
          <Button onClick={onAddSourceVideo} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Video
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Source Videos ({sourceSegments.length})</h2>
        <Button onClick={onAddSourceVideo} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add More
        </Button>
      </div>

      <div className="space-y-3">
        {sourceSegments.map((segment, index) => (
          <div
            key={segment.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <SourceVideoItem
              video={segment.video}
              segmentId={segment.id}
              index={index}
              onRemove={onRemoveSegment}
              onDuplicate={onDuplicateVideo}
              onSegmentChange={onSegmentChange}
              onPlayingChange={handlePlayingChange}
              shouldPause={playingSegmentId !== null && playingSegmentId !== segment.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
