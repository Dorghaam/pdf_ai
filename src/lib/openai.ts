import OpenAI from 'openai';

// TODO: Set your OPENAI_API_KEY in .env
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // baseURL: process.env.OPENAI_BASE_URL, // Optional: if using a proxy or different endpoint
});

export const embeddingModel = 'text-embedding-3-small';
export const chatModel = 'gpt-4o';

/**
 * Generates embeddings for an array of text chunks.
 * @param texts Array of strings to embed.
 * @returns Promise resolving to an array of embedding results.
 */
export async function embedTextChunks(texts: string[]): Promise<{ input: string, embedding: number[] }[]> {
  if (!texts || texts.length === 0) return [];
  // TODO: Implement batching if texts array is very large to stay within API limits
  try {
    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: texts,
    });
    return response.data.map((item, index) => ({
        input: texts[index], // Or however you want to associate the original text
        embedding: item.embedding,
    }));
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings from OpenAI.');
  }
}

interface TextChunk {
  content: string;
  // Add other metadata like page number, chunk index if needed
  pageNumber?: number;
  chunkIndex?: number;
}

/**
 * Placeholder for text chunking logic.
 * @param text The full text to chunk.
 * @param options Chunking options (e.g., chunkSize, overlap).
 * @returns An array of text chunks.
 */
export async function generateTextChunks(
  text: string,
  options: { chunkSize: number; chunkOverlap: number }
): Promise<TextChunk[]> {
  // Implementation of a chunking strategy.
  const { chunkSize, chunkOverlap } = options;
  const chunks: TextChunk[] = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    chunks.push({ content: text.substring(i, end) });
    i += chunkSize - chunkOverlap;
    if (i >= text.length && end === text.length) break; // Avoid infinite loop on last chunk if overlap makes i >= length
    if (i < 0) i = end; // Safety for large overlap
  }
  console.log(`Generated ${chunks.length} chunks.`);
  return chunks.filter(chunk => chunk.content.trim() !== ""); // Filter out empty chunks
}