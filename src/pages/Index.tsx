import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { VideoLibrary } from '@/components/VideoLibrary';
import { SegmentSelector } from '@/components/SegmentSelector';
import { Timeline } from '@/components/Timeline';
import { JSONViewer } from '@/components/JSONViewer';
import type { Video, VideoSegment, TimelineSegment, RemixData } from '@/types/video';

const Index = () => {
  useSeoMeta({
    title: 'Video Remix - Mix and Match Video Segments',
    description: 'Create new videos by combining segments from existing short-form videos.',
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [timelineSegments, setTimelineSegments] = useState<TimelineSegment[]>([]);

  const handleAddVideo = (video: Video) => {
    setVideos((prev) => [...prev, video]);
  };

  const handleRemoveVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (selectedVideo?.id === id) {
      setSelectedVideo(null);
    }
    // Remove timeline segments from this video
    setTimelineSegments((prev) => prev.filter((s) => s.videoId !== id));
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleVideoDurationLoaded = (videoId: string, duration: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, duration } : v))
    );
    if (selectedVideo?.id === videoId) {
      setSelectedVideo((prev) => (prev ? { ...prev, duration } : null));
    }
  };

  const handleAddSegment = (segment: VideoSegment) => {
    const timelineSegment: TimelineSegment = {
      ...segment,
      order: timelineSegments.length,
    };
    setTimelineSegments((prev) => [...prev, timelineSegment]);
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
      videoId: seg.videoId,
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Video Remix Studio
          </h1>
          <p className="text-lg text-muted-foreground">
            Mix and match video segments to create something new ✨
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Left Column - Video Library */}
          <div className="col-span-12 lg:col-span-3 h-full">
            <VideoLibrary
              videos={videos}
              onAddVideo={handleAddVideo}
              onRemoveVideo={handleRemoveVideo}
              onSelectVideo={handleSelectVideo}
              selectedVideoId={selectedVideo?.id}
            />
          </div>

          {/* Middle Column - Segment Selector & Timeline */}
          <div className="col-span-12 lg:col-span-6 h-full flex flex-col gap-4">
            <div className="flex-1">
              <SegmentSelector
                video={selectedVideo}
                onAddSegment={handleAddSegment}
                onVideoDurationLoaded={handleVideoDurationLoaded}
              />
            </div>
            <div className="flex-1">
              <Timeline
                segments={timelineSegments}
                onReorder={handleReorderSegments}
                onRemove={handleRemoveSegment}
              />
            </div>
          </div>

          {/* Right Column - JSON Viewer */}
          <div className="col-span-12 lg:col-span-3 h-full">
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
    </div>
  );
};

export default Index;
