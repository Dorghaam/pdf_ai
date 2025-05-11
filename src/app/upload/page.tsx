import { PdfDropzone } from '@/components/pdf/PdfDropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default function UploadPage() {
  async function handleUploadSuccess(blob: { url: string, id: string }) {
    // In a real application, you'd need to create the document in your database
    // and then redirect to the document page or processing status page
    
    // This is a placeholder, as we'd typically handle document creation on the server
    const documentId = blob.id;
    
    // Ideally, we'd redirect to a processing status page or directly to the chat interface
    // if processing happens in the background
    redirect(`/documents`);
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Upload PDF</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload a Document</CardTitle>
          <CardDescription>
            Upload a PDF document to chat with its contents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PdfDropzone onUploadSuccess={handleUploadSuccess} />
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <h3 className="font-medium mb-2">Important Notes:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Files must be in PDF format</li>
          <li>Maximum file size is 10MB</li>
          <li>Your document will be processed automatically after upload</li>
          <li>Processing time depends on the document size and complexity</li>
          <li>All documents are stored securely and privately</li>
        </ul>
      </div>
    </div>
  );
}