// General TypeScript interfaces for the application

export interface UserProfile {
  id: string;
  email?: string;
  displayName?: string;
  // Add other profile fields as needed
}

export interface Document {
  id: string;
  userId: string;
  fileName: string;
  blobUrl: string;
  status: 'pending_processing' | 'processing' | 'processed' | 'failed' | 'uploaded';
  uploadedAt: string; // ISO date string
  processedAt?: string; // ISO date string
  // Add other document metadata
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber?: number;
  // Embedding is usually not sent to client, but defined for server use
  // embedding?: number[];
  metadata?: Record<string, any>;
}