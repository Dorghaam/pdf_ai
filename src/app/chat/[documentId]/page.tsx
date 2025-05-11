import { ChatInterface } from './components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

export default async function ChatPage({ params }: { params: Params }) {
  const { documentId } = params;

  if (!documentId || typeof documentId !== 'string') {
    return notFound();
  }

  // In a real application, you'd fetch the document from your database
  // to ensure it exists and the user has access to it
  
  return (
    <div className="container max-w-6xl py-8">
      <div className="grid grid-cols-1 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Chat with Document</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatInterface documentId={documentId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}