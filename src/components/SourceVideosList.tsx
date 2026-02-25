import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Video } from 'lucide-react';
import { SourceVideoItem } from '@/components/SourceVideoItem';
import type { SourceVideo, TimelineSegment } from '@/types/video';

interface SourceVideosListProps {
  sourceVideos: SourceVideo[];
  onAddSourceVideo: () => void;
  onRemoveSourceVideo: (id: string) => void;
  onAddSegment: (segment: TimelineSegment) => void;
}

export function SourceVideosList({
  sourceVideos,
  onAddSourceVideo,
  onRemoveSourceVideo,
  onAddSegment,
}: SourceVideosListProps) {
  if (sourceVideos.length === 0) {
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
        <h2 className="text-2xl font-bold">Source Videos ({sourceVideos.length})</h2>
        <Button onClick={onAddSourceVideo} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add More
        </Button>
      </div>

      <div className="space-y-4">
        {sourceVideos.map((video) => (
          <SourceVideoItem
            key={video.id}
            video={video}
            onRemove={onRemoveSourceVideo}
            onAddSegment={onAddSegment}
          />
        ))}
      </div>
    </div>
  );
}
