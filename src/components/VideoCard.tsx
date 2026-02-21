import { Card, CardContent } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useVideoAuthor } from '@/hooks/useVideoAuthor';
import type { Video } from '@/types/video';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const { displayName } = useVideoAuthor(video);

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[9/16] bg-muted overflow-hidden rounded-t">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {video.duration.toFixed(0)}s
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="font-medium text-sm truncate mb-1">
            {video.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatDate(video.publishedAt)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
