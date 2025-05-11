'use server';

import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/client';

export async function uploadPdfAction(formData: FormData) {
  const file = formData.get('pdfFile') as File;

  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'Invalid file type. Please upload a PDF.' };
  }

  const fileName = file.name;
  const fileId = nanoid();
  const blobName = `${fileId}-${fileName}`;

  try {
    // Initialize Supabase client
    const supabase = createClient();

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('pdfs')
      .upload(blobName, file, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (storageError) {
      throw storageError;
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase
      .storage
      .from('pdfs')
      .getPublicUrl(blobName);

    const blobUrl = publicUrlData.publicUrl;

    // Store metadata in Supabase database
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        id: fileId,
        file_name: fileName,
        blob_url: blobUrl,
        status: 'uploaded'
      })
      .select()
      .single();

    if (docError) {
      throw docError;
    }

    // Trigger processing of the uploaded PDF
    // This would be an API route that handles extracting text, creating embeddings, etc.
    const processingResponse = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: fileId,
        blobUrl,
        fileName
      }),
    });

    if (!processingResponse.ok) {
      console.warn('Processing request queued, but returned error:', await processingResponse.text());
    }

    revalidatePath('/documents');

    return {
      success: true,
      blob: {
        url: blobUrl,
        id: fileId
      }
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    let errorMessage = 'An unknown error occurred during upload.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}