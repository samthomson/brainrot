import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useToast } from '@/hooks/useToast';
import type { RemixData } from '@/types/video';
import type { NostrEvent } from '@nostrify/nostrify';

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
    console.log('=== Broadcast Clicked ===');
    console.log('User:', user);
    console.log('Segments:', remixData.segments.length);
    console.log('Selected Relay:', selectedRelay);

    if (!user) {
      console.log('ERROR: Not logged in');
      toast({
        title: 'Login Required',
        description: 'Please login with Nostr to broadcast job requests',
        variant: 'destructive',
      });
      return;
    }

    if (remixData.segments.length === 0) {
      console.log('ERROR: No segments');
      toast({
        title: 'No Segments',
        description: 'Add segments to your timeline before broadcasting',
        variant: 'destructive',
      });
      return;
    }

    setIsBroadcasting(true);

    try {
      console.log('Signing event...');
      
      // Sign the event first
      // Using kind 5342 for video remix DVM job requests
      const totalDuration = remixData.segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);
      
      const unsignedEvent = {
        kind: 5342,
        content: JSON.stringify(remixData),
        tags: [
          ['output', 'video/mp4'],
          ['relays', selectedRelay],
          ['param', 'segments', remixData.segments.length.toString()],
          ['param', 'duration', totalDuration.toFixed(2)],
          ['t', 'video-remix'],
          ['alt', `Video remix job: combine ${remixData.segments.length} segments into one video (${totalDuration.toFixed(2)}s total)`],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await user.signer.signEvent(unsignedEvent);
      console.log('Event signed:', signedEvent);

      console.log('Creating relay connection to:', selectedRelay);
      const relay = nostr.relay(selectedRelay);
      console.log('Relay created');

      console.log('Publishing event to relay...');
      
      // Publish with timeout
      await Promise.race([
        relay.event(signedEvent),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Relay timeout after 10 seconds')), 10000)
        ),
      ]);

      console.log('=== DVM Job Request Published Successfully ===');
      console.log('Event ID:', signedEvent.id);
      console.log('Relay:', selectedRelay);
      console.log('Event:', signedEvent);

      toast({
        title: 'Broadcasted Successfully! ✅',
        description: `Job request sent to ${selectedRelay.replace('wss://', '')}. Event ID: ${signedEvent.id.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('=== Broadcast Error ===');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Broadcast Failed',
        description: errorMessage || 'Unknown error occurred. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      console.log('Setting broadcasting to false');
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
