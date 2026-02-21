export interface Video {
  id: string;
  name: string;
  url: string;
  duration: number;
  file?: File;
}

export interface VideoSegment {
  id: string;
  videoId: string;
  videoName: string;
  startTime: number;
  endTime: number;
  duration: number;
}

export interface TimelineSegment extends VideoSegment {
  order: number;
}

export interface RemixData {
  segments: Array<{
    videoId: string;
    videoName: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  totalDuration: number;
}
