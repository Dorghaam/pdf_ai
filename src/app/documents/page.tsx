import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// In a real application, this would be a server component that fetches documents
// from your database

export default function DocumentsPage() {
  // Mock data - in a real app, this would come from your database
  const documents = [
    {
      id: 'doc1',
      fileName: 'Example PDF 1.pdf',
      status: 'processed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'doc2',
      fileName: 'Example PDF 2.pdf',
      status: 'processing',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Documents</h1>
        <Link href="/upload">
          <Button>Upload New Document</Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
          <p className="text-muted-foreground mb-6">Upload your first PDF to get started.</p>
          <Link href="/upload">
            <Button>Upload a Document</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{doc.fileName}</CardTitle>
                <CardDescription>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    doc.status === 'processed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                  }`}>
                    {doc.status === 'processed' ? 'Ready' : 'Processing'}
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                {doc.status === 'processed' ? (
                  <Link href={`/chat/${doc.id}`} className="w-full">
                    <Button className="w-full">Chat with Document</Button>
                  </Link>
                ) : (
                  <Button className="w-full" disabled>Processing...</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}