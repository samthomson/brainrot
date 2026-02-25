import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      <div>
        <h2 className="text-xl font-bold mb-4">Source Videos (0)</h2>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Button onClick={onAddSourceVideo} size="lg" className="h-24 w-24 rounded-full">
              <Plus className="h-12 w-12" />
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Add your first video
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Source Videos ({sourceSegments.length})</h2>

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

        {/* Big + Button at End */}
        <Card className="border-dashed">
          <CardContent className="py-8 flex items-center justify-center">
            <Button onClick={onAddSourceVideo} size="lg" className="h-16 w-16 rounded-full">
              <Plus className="h-8 w-8" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
