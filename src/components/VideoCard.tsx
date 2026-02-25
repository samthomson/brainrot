import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Plus, Copy, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useVideoAuthor } from '@/hooks/useVideoAuthor';
import { useToast } from '@/hooks/useToast';
import type { Video } from '@/types/video';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  onQuickAdd?: () => void;
  showQuickAdd?: boolean;
  onBlockUser?: (pubkey: string) => void;
}

export function VideoCard({ video, onClick, onQuickAdd, showQuickAdd = false, onBlockUser }: VideoCardProps) {
  const { displayName } = useVideoAuthor(video);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleCopyPubkey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(video.pubkey);
    toast({
      title: 'Copied!',
      description: 'Pubkey copied to clipboard',
    });
  };

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBlockUser) {
      onBlockUser(video.pubkey);
    }
  };

  useEffect(() => {
    // If no thumbnail URL, try to generate one from the video
    if (!video.thumbnailUrl && videoRef.current) {
      const videoEl = videoRef.current;
      
      const generateThumbnail = () => {
        try {
          // Seek to 1 second or 10% of duration, whichever is less
          const seekTime = Math.min(1, (videoEl.duration || 10) * 0.1);
          videoEl.currentTime = seekTime;
        } catch (error) {
          console.error('Error seeking video for thumbnail:', error);
        }
      };

      const captureThumbnail = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
            setGeneratedThumbnail(thumbnail);
          }
        } catch (error) {
          console.error('Error generating thumbnail:', error);
        }
      };

      videoEl.addEventListener('loadedmetadata', generateThumbnail);
      videoEl.addEventListener('seeked', captureThumbnail);

      return () => {
        videoEl.removeEventListener('loadedmetadata', generateThumbnail);
        videoEl.removeEventListener('seeked', captureThumbnail);
      };
    }
  }, [video.thumbnailUrl]);

  const formatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const thumbnailSrc = video.thumbnailUrl || generatedThumbnail;

  return (
    <Card
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[9/16] bg-muted overflow-hidden rounded-t">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={video.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Hidden video element for thumbnail generation */}
          {!video.thumbnailUrl && !generatedThumbnail && (
            <video
              ref={videoRef}
              src={video.url}
              className="hidden"
              preload="metadata"
              crossOrigin="anonymous"
              muted
            />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {showQuickAdd && onQuickAdd && (
              <Button
                size="icon"
                className="rounded-full shadow-lg h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full shadow-lg h-8 w-8"
              onClick={handleCopyPubkey}
              title="Copy pubkey"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {onBlockUser && (
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full shadow-lg h-8 w-8"
                onClick={handleBlock}
                title="Block this user"
              >
                <Ban className="h-3 w-3" />
              </Button>
            )}
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
