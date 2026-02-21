import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, FileJson, Check } from 'lucide-react';
import { useState } from 'react';
import type { RemixData } from '@/types/video';

interface JSONViewerProps {
  data: RemixData;
}

export function JSONViewer({ data }: JSONViewerProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Remix JSON
          </CardTitle>
          <Button onClick={handleCopy} size="sm" variant="outline">
            {copied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{jsonString}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
