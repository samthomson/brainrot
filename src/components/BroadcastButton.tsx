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
      console.log('Creating relay connection...');
      const relay = nostr.relay(selectedRelay);
      console.log('Relay created:', relay);

      console.log('Publishing event...');
      const event = await relay.event({
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

      console.log('=== DVM Job Request Published Successfully ===');
      console.log('Event:', event);
      console.log('Event ID:', event.id);
      console.log('Relay:', selectedRelay);
      console.log('Data:', remixData);

      toast({
        title: 'Broadcasted Successfully! ✅',
        description: `Job request sent to ${selectedRelay.replace('wss://', '')}. Check console for event ID.`,
      });
    } catch (error) {
      console.error('=== Broadcast Error ===');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      console.error('Error object:', JSON.stringify(error, null, 2));
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Broadcast Failed',
        description: errorMessage || 'Unknown error occurred',
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
