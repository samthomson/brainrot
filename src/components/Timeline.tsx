import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Film } from 'lucide-react';
import type { TimelineSegment } from '@/types/video';

interface TimelineProps {
  segments: TimelineSegment[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
}

export function Timeline({ segments, onReorder, onRemove }: TimelineProps) {
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

  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Timeline
        </CardTitle>
        {segments.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total Duration: {totalDuration.toFixed(2)}s ({segments.length}{' '}
            segment{segments.length !== 1 ? 's' : ''})
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Add segments to build your remix
          </div>
        ) : (
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="group relative"
              >
                <Card className="cursor-move hover:border-primary transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-mono">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{segment.videoName}</p>
                      <p className="text-sm text-muted-foreground">
                        {segment.startTime.toFixed(2)}s -{' '}
                        {segment.endTime.toFixed(2)}s ({segment.duration.toFixed(2)}
                        s)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(segment.id)}
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
      </CardContent>
    </Card>
  );
}
