import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import type { Video } from '@/types/video';

function parseVideoEvent(event: NostrEvent): Video | null {
  try {
    const titleTag = event.tags.find(([name]) => name === 'title')?.[1];
    const imetaTags = event.tags.filter(([name]) => name === 'imeta');
    
    // Get video URL from first imeta tag
    let videoUrl = '';
    let thumbnailUrl = '';
    let duration = 0;
    
    if (imetaTags.length > 0) {
      const imetaTag = imetaTags[0];
      const urlEntry = imetaTag.find((entry) => entry.startsWith('url '));
      const imageEntry = imetaTag.find((entry) => entry.startsWith('image '));
      const durationEntry = imetaTag.find((entry) => entry.startsWith('duration '));
      
      if (urlEntry) {
        videoUrl = urlEntry.replace('url ', '');
      }
      if (imageEntry) {
        thumbnailUrl = imageEntry.replace('image ', '');
      }
      if (durationEntry) {
        duration = parseFloat(durationEntry.replace('duration ', '')) || 0;
      }
    }
    
    if (!videoUrl) return null;
    
    return {
      id: event.id,
      event,
      name: titleTag || `Video by ${event.pubkey.slice(0, 8)}...`,
      url: videoUrl,
      duration,
      thumbnailUrl,
      pubkey: event.pubkey,
    };
  } catch (error) {
    console.error('Error parsing video event:', error);
    return null;
  }
}

export function useShortFormVideos() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['short-form-videos'],
    queryFn: async () => {
      // Query for short-form video events (kind 22 and 34236)
      const events = await nostr.query([
        {
          kinds: [22, 34236],
          limit: 50,
        },
      ]);

      const videos: Video[] = [];
      
      for (const event of events) {
        const video = parseVideoEvent(event);
        if (video) {
          videos.push(video);
        }
      }

      return videos;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
