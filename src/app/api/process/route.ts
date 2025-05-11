import { NextRequest, NextResponse } from 'next/server';
import { getTextFromPdf } from '@/lib/pdfParser';
import { embedTextChunks, generateTextChunks } from '@/lib/openai';
import { saveChunksToVectorStore } from '@/lib/vectorStore';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

// Define the expected request body schema
const processRequestBodySchema = z.object({
  blobUrl: z.string().url(),
  documentId: z.string(),
  fileName: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = processRequestBodySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { blobUrl, documentId, fileName } = validation.data;
    const supabaseAdmin = createAdminClient();

    // Update document status to processing
    await supabaseAdmin
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // 1. Fetch PDF from Supabase Storage
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const pdfBuffer = await response.arrayBuffer();

    // 2. Extract text using pdfjs-dist
    const extractedText = await getTextFromPdf(pdfBuffer);
    if (!extractedText || extractedText.trim() === '') {
      await supabaseAdmin
        .from('documents')
        .update({ status: 'processing_failed' })
        .eq('id', documentId);

      return NextResponse.json(
        { error: 'Could not extract text from PDF or PDF is empty.' },
        { status: 400 }
      );
    }

    // 3. Chunk text
    const chunks = await generateTextChunks(extractedText, {
      chunkSize: 1000,
      chunkOverlap: 200
    });

    // 4. Generate embeddings for chunks using OpenAI
    const chunksWithEmbeddings = await embedTextChunks(
      chunks.map(chunk => chunk.content)
    );

    // 5. Store chunks and embeddings in Supabase pgvector
    await saveChunksToVectorStore(
      documentId,
      chunks.map((chunk, i) => ({
        ...chunk,
        embedding: chunksWithEmbeddings[i].embedding,
      }))
    );

    // Update document status to processed
    await supabaseAdmin
      .from('documents')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return NextResponse.json({
      success: true,
      message: `Processed ${fileName} successfully. Chunks: ${chunks.length}`
    });
  } catch (error) {
    console.error('Processing error:', error);
    let errorMessage = 'An unknown error occurred during processing.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Update document status to failed
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from('documents')
        .update({ status: 'processing_failed' })
        .eq('id', documentId);
    } catch (dbError) {
      console.error('Failed to update document status:', dbError);
    }

    return NextResponse.json(
      { error: 'Failed to process PDF.', details: errorMessage },
      { status: 500 }
    );
  }
}