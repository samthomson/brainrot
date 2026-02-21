import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video as VideoIcon, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Video } from '@/types/video';

interface VideoLibraryProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  selectedVideoId?: string;
  isLoading?: boolean;
}

export function VideoLibrary({
  videos,
  onSelectVideo,
  selectedVideoId,
  isLoading,
}: VideoLibraryProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="h-5 w-5" />
          Nostr Short Videos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {videos.length} videos found
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-3">
        <ScrollArea className="h-full pr-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading videos from Nostr...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className={`cursor-pointer transition-colors ${
                    selectedVideoId === video.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onSelectVideo(video)}
                >
                  <CardContent className="p-3 flex gap-3">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <VideoIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{video.name}</p>
                      {video.duration > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {video.duration.toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
