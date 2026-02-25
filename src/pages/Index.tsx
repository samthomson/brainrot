import { useState, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import { SourceVideosList } from '@/components/SourceVideosList';
import { TimelineTrack } from '@/components/TimelineTrack';
import { JSONViewer } from '@/components/JSONViewer';
import { RemixPreview } from '@/components/RemixPreview';
import { VideoPickerModal } from '@/components/VideoPickerModal';
import { ClearAllDialog } from '@/components/ClearAllDialog';
import { BlocklistManager } from '@/components/BlocklistManager';
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
  
  interface SourceSegment {
    id: string;
    video: SourceVideo;
  }
  
  const [sourceSegments, setSourceSegments] = usePersistedState<SourceSegment[]>('video-remix-source-segments', []);
  const [timelineSegments, setTimelineSegments] = usePersistedState<TimelineSegment[]>('video-remix-timeline', []);
  const [blocklist, setBlocklist] = usePersistedState<string[]>('video-remix-blocklist', []);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isBlocklistOpen, setIsBlocklistOpen] = useState(false);

  // Derive sourceVideos for preview component
  const sourceVideos = sourceSegments.map(s => s.video);

  const handleAddSourceVideo = () => {
    setIsPickerOpen(true);
  };

  const handleSelectVideo = (video: Video) => {
    const sourceVideo: SourceVideo = {
      ...video,
      segments: [],
    };
    
    const newSegment: SourceSegment = {
      id: crypto.randomUUID(),
      video: sourceVideo,
    };
    
    setSourceSegments((prev) => [...prev, newSegment]);
    
    // Create initial timeline segment
    const timelineSegment: TimelineSegment = {
      id: newSegment.id,
      sourceVideoId: sourceVideo.id,
      videoName: sourceVideo.name,
      videoEventId: sourceVideo.event.id,
      startTime: 0,
      endTime: Math.min(5, sourceVideo.duration || 5),
      duration: Math.min(5, sourceVideo.duration || 5),
      order: sourceSegments.length,
    };
    
    setTimelineSegments((prev) => [...prev, timelineSegment]);
    
    toast({
      title: 'Video Added',
      description: `Added "${video.name}" to timeline`,
    });
  };

  const handleDuplicateVideo = (video: SourceVideo) => {
    const newSegment: SourceSegment = {
      id: crypto.randomUUID(),
      video,
    };
    
    setSourceSegments((prev) => [...prev, newSegment]);
    
    // Create initial timeline segment for duplicate
    const timelineSegment: TimelineSegment = {
      id: newSegment.id,
      sourceVideoId: video.id,
      videoName: video.name,
      videoEventId: video.event.id,
      startTime: 0,
      endTime: Math.min(5, video.duration || 5),
      duration: Math.min(5, video.duration || 5),
      order: timelineSegments.length,
    };
    
    setTimelineSegments((prev) => [...prev, timelineSegment]);
    
    toast({
      title: 'Segment Duplicated',
      description: `Created duplicate segment from "${video.name}"`,
    });
  };

  const handleClearAll = () => {
    setSourceSegments([]);
    setTimelineSegments([]);
    setIsClearDialogOpen(false);
    toast({
      title: 'Cleared',
      description: 'All videos and timeline cleared',
    });
  };

  const handleRemoveSegment = (segmentId: string) => {
    setSourceSegments((prev) => prev.filter((s) => s.id !== segmentId));
    setTimelineSegments((prev) => 
      prev.filter((s) => s.id !== segmentId).map((seg, index) => ({ ...seg, order: index }))
    );
  };

  const handleSegmentChange = useCallback((segmentId: string, segmentData: Omit<TimelineSegment, 'id' | 'order'>) => {
    setTimelineSegments((prev) => {
      const existing = prev.find(s => s.id === segmentId);
      if (!existing) return prev;
      
      // Check if data actually changed to avoid unnecessary updates
      if (
        existing.startTime === segmentData.startTime &&
        existing.endTime === segmentData.endTime &&
        existing.duration === segmentData.duration
      ) {
        return prev;
      }
      
      return prev.map(s => 
        s.id === segmentId 
          ? { ...s, ...segmentData }
          : s
      );
    });
  }, [setTimelineSegments]);

  const handleReorderSourceSegments = (fromIndex: number, toIndex: number) => {
    setSourceSegments((prev) => {
      const newSegments = [...prev];
      const [removed] = newSegments.splice(fromIndex, 1);
      newSegments.splice(toIndex, 0, removed);
      return newSegments;
    });
    
    // Reorder timeline to match
    setTimelineSegments((prev) => {
      const segmentIds = sourceSegments.map(s => s.id);
      const [movedId] = segmentIds.splice(fromIndex, 1);
      segmentIds.splice(toIndex, 0, movedId);
      
      return prev
        .sort((a, b) => segmentIds.indexOf(a.id) - segmentIds.indexOf(b.id))
        .map((seg, index) => ({ ...seg, order: index }));
    });
  };

  const handleReorderTimeline = (fromIndex: number, toIndex: number) => {
    // Reorder source segments
    setSourceSegments((prev) => {
      const newSegments = [...prev];
      const [removed] = newSegments.splice(fromIndex, 1);
      newSegments.splice(toIndex, 0, removed);
      return newSegments;
    });
    
    // Reorder timeline
    setTimelineSegments((prev) => {
      const newSegments = [...prev];
      const [removed] = newSegments.splice(fromIndex, 1);
      newSegments.splice(toIndex, 0, removed);
      return newSegments.map((seg, index) => ({ ...seg, order: index }));
    });
  };

  const handleRemoveTimelineSegment = (id: string) => {
    // This is called from timeline track, just reorder
    const index = timelineSegments.findIndex(s => s.id === id);
    if (index === -1) return;
    
    handleRemoveSegment(id);
  };

  const handleAddToBlocklist = (pubkey: string) => {
    if (blocklist.includes(pubkey)) return;
    setBlocklist((prev) => [...prev, pubkey]);
    toast({
      title: 'User Blocked',
      description: 'Videos from this user will be hidden',
    });
  };

  const handleRemoveFromBlocklist = (pubkey: string) => {
    setBlocklist((prev) => prev.filter(p => p !== pubkey));
    toast({
      title: 'User Unblocked',
      description: 'Videos from this user will now appear',
    });
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
              {(sourceSegments.length > 0 || timelineSegments.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsClearDialogOpen(true)}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Source Videos */}
          <div className="lg:col-span-2 space-y-4">
            <SourceVideosList
              sourceSegments={sourceSegments}
              onAddSourceVideo={handleAddSourceVideo}
              onRemoveSegment={handleRemoveSegment}
              onDuplicateVideo={handleDuplicateVideo}
              onSegmentChange={handleSegmentChange}
              onReorder={handleReorderSourceSegments}
            />

            {/* Timeline */}
            <TimelineTrack
              segments={timelineSegments}
              sourceVideos={sourceVideos}
              onReorder={handleReorderTimeline}
              onRemove={handleRemoveTimelineSegment}
            />
          </div>

          {/* Right Column - Preview & JSON */}
          <div className="space-y-4">
            <RemixPreview
              segments={timelineSegments}
              sourceVideos={sourceVideos}
            />
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
        blocklist={blocklist}
        onAddToBlocklist={handleAddToBlocklist}
        onOpenBlocklistManager={() => {
          setIsPickerOpen(false);
          setIsBlocklistOpen(true);
        }}
      />

      {/* Blocklist Manager */}
      <BlocklistManager
        open={isBlocklistOpen}
        onClose={() => setIsBlocklistOpen(false)}
        blocklist={blocklist}
        onAddToBlocklist={handleAddToBlocklist}
        onRemoveFromBlocklist={handleRemoveFromBlocklist}
      />

      {/* Clear All Confirmation Dialog */}
      <ClearAllDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        onConfirm={handleClearAll}
      />
    </div>
  );
};

export default Index;
