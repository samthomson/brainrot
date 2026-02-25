import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { TimelineEditor } from '@/components/TimelineEditor';
import { JSONViewer } from '@/components/JSONViewer';
import { VideoPickerModal } from '@/components/VideoPickerModal';
import { usePersistedState } from '@/hooks/usePersistedState';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import type { Video, SourceVideo, TimelineSegment, RemixData } from '@/types/video';

const Index = () => {
  useSeoMeta({
    title: 'Video Remix - Mix and Match Nostr Video Segments',
    description: 'Create new videos by combining segments from existing short-form Nostr videos.',
  });

  const { toast } = useToast();
  const [sourceVideos, setSourceVideos] = usePersistedState<SourceVideo[]>('video-remix-sources', []);
  const [timelineSegments, setTimelineSegments] = usePersistedState<TimelineSegment[]>('video-remix-timeline', []);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleAddSourceVideo = () => {
    setIsPickerOpen(true);
  };

  const handleSelectVideo = (video: Video) => {
    // Check if video already added
    const exists = sourceVideos.some((v) => v.id === video.id);
    if (exists) {
      toast({
        title: 'Already Added',
        description: 'This video is already in your source videos',
      });
      return;
    }
    
    const sourceVideo: SourceVideo = {
      ...video,
      segments: [],
    };
    setSourceVideos((prev) => [...prev, sourceVideo]);
    toast({
      title: 'Video Added',
      description: `Added "${video.name}" to source videos`,
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all videos and timeline? This cannot be undone.')) {
      setSourceVideos([]);
      setTimelineSegments([]);
      toast({
        title: 'Cleared',
        description: 'All videos and timeline cleared',
      });
    }
  };

  const handleRemoveSourceVideo = (id: string) => {
    setSourceVideos((prev) => prev.filter((v) => v.id !== id));
    // Remove all segments from this video
    setTimelineSegments((prev) => prev.filter((s) => s.sourceVideoId !== id));
  };

  const handleAddSegment = (segment: TimelineSegment) => {
    setTimelineSegments((prev) => [...prev, segment]);
    toast({
      title: 'Segment Added',
      description: `Added ${segment.duration.toFixed(2)}s segment to timeline`,
    });
  };

  const handleReorderSegments = (fromIndex: number, toIndex: number) => {
    setTimelineSegments((prev) => {
      const newSegments = [...prev];
      const [removed] = newSegments.splice(fromIndex, 1);
      newSegments.splice(toIndex, 0, removed);
      return newSegments.map((seg, index) => ({ ...seg, order: index }));
    });
  };

  const handleRemoveSegment = (id: string) => {
    setTimelineSegments((prev) =>
      prev.filter((s) => s.id !== id).map((seg, index) => ({ ...seg, order: index }))
    );
  };

  const remixData: RemixData = {
    segments: timelineSegments.map((seg) => ({
      videoEventId: seg.videoEventId,
      videoName: seg.videoName,
      startTime: seg.startTime,
      endTime: seg.endTime,
      duration: seg.duration,
    })),
    totalDuration: timelineSegments.reduce((sum, seg) => sum + seg.duration, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950 p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1"></div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Video Remix Studio
              </h1>
              <p className="text-lg text-muted-foreground">
                Cut and combine Nostr short-form videos into something new ✨
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {(sourceVideos.length > 0 || timelineSegments.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Timeline Editor - Takes 2 columns */}
          <div className="lg:col-span-2 h-full overflow-hidden">
            <TimelineEditor
              sourceVideos={sourceVideos}
              onAddSourceVideo={handleAddSourceVideo}
              onRemoveSourceVideo={handleRemoveSourceVideo}
              timelineSegments={timelineSegments}
              onAddSegment={handleAddSegment}
              onRemoveSegment={handleRemoveSegment}
              onReorderSegments={handleReorderSegments}
            />
          </div>

          {/* JSON Viewer */}
          <div className="h-full">
            <JSONViewer data={remixData} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <a
            href="https://shakespeare.diy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Vibed with Shakespeare
          </a>
        </div>
      </div>

      {/* Video Picker Modal */}
      <VideoPickerModal
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectVideo={handleSelectVideo}
      />
    </div>
  );
};

export default Index;
