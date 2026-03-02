import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useToast } from '@/hooks/useToast';
import type { RemixData } from '@/types/video';

interface BroadcastButtonProps {
  remixData: RemixData;
  selectedRelay: string;
  disabled?: boolean;
}

export function BroadcastButton({ remixData, selectedRelay, disabled }: BroadcastButtonProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();

  const handleBroadcast = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login with Nostr to broadcast job requests',
        variant: 'destructive',
      });
      return;
    }

    if (remixData.segments.length === 0) {
      toast({
        title: 'No Segments',
        description: 'Add segments to your timeline before broadcasting',
        variant: 'destructive',
      });
      return;
    }

    setIsBroadcasting(true);

    try {
      const relay = nostr.relay(selectedRelay);

      // Create DVM job request (kind 5900 for video processing)
      const jobRequest = await relay.event({
        kind: 5900,
        content: JSON.stringify(remixData),
        tags: [
          ['i', JSON.stringify(remixData), 'text'],
          ['output', 'video/mp4'],
          ['relays', selectedRelay],
          ['t', 'video-remix'],
          ['alt', 'Video remix job request: combine multiple video segments into one output video'],
        ],
      });

      toast({
        title: 'Broadcasted!',
        description: `Job request sent to ${selectedRelay.replace('wss://', '')}`,
      });

      console.log('DVM Job Request:', jobRequest);
    } catch (error) {
      console.error('Broadcast error:', error);
      toast({
        title: 'Broadcast Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <Button
      onClick={handleBroadcast}
      disabled={disabled || isBroadcasting || !user}
      size="lg"
      className="w-full"
    >
      {isBroadcasting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Broadcasting...
        </>
      ) : (
        <>
          <Send className="h-4 w-4 mr-2" />
          Broadcast to DVM
        </>
      )}
    </Button>
  );
}
