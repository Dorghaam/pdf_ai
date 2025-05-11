import { z } from 'zod';

export const UploadFormSchema = z.object({
  pdfFile: z
    .custom<File>((val) => val instanceof File, 'Please upload a file.')
    .refine((file) => file.type === 'application/pdf', 'File must be a PDF.')
    .refine((file) => file.size < 10 * 1024 * 1024, 'File size must be less than 10MB.'), // Example size limit
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.date().optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  documentId: z.string().uuid(),
});