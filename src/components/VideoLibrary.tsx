import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Video as VideoIcon } from 'lucide-react';
import type { Video } from '@/types/video';

interface VideoLibraryProps {
  videos: Video[];
  onAddVideo: (video: Video) => void;
  onRemoveVideo: (id: string) => void;
  onSelectVideo: (video: Video) => void;
  selectedVideoId?: string;
}

export function VideoLibrary({
  videos,
  onAddVideo,
  onRemoveVideo,
  onSelectVideo,
  selectedVideoId,
}: VideoLibraryProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleAddFromUrl = () => {
    if (!urlInput.trim()) return;

    const video: Video = {
      id: crypto.randomUUID(),
      name: `Video ${videos.length + 1}`,
      url: urlInput,
      duration: 0, // Will be set when video loads
    };

    onAddVideo(video);
    setUrlInput('');
  };

  const handleAddFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video: Video = {
      id: crypto.randomUUID(),
      name: file.name,
      url,
      duration: 0,
      file,
    };

    onAddVideo(video);
    e.target.value = '';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="h-5 w-5" />
          Video Library
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter video URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFromUrl()}
            />
            <Button onClick={handleAddFromUrl} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Input
              type="file"
              accept="video/*"
              onChange={handleAddFromFile}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {videos.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Add videos to get started
            </div>
          ) : (
            videos.map((video) => (
              <Card
                key={video.id}
                className={`cursor-pointer transition-colors ${
                  selectedVideoId === video.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
                onClick={() => onSelectVideo(video)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.name}</p>
                    {video.duration > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {video.duration.toFixed(1)}s
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveVideo(video.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
