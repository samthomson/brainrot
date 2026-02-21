import type { NostrEvent } from '@nostrify/nostrify';

export interface Video {
  id: string;
  event: NostrEvent;
  name: string;
  url: string;
  duration: number;
  thumbnailUrl?: string;
  pubkey: string;
}

export interface VideoSegment {
  id: string;
  videoId: string;
  videoName: string;
  videoEventId: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface TimelineSegment extends VideoSegment {
  order: number;
}

export interface RemixData {
  segments: Array<{
    videoEventId: string;
    videoName: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  totalDuration: number;
}
