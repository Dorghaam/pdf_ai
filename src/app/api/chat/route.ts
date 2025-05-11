// This route uses the Vercel AI SDK to stream responses
import { CoreMessage, streamText } from 'ai';
import { openai } from '@/lib/openai'; // Your configured OpenAI client
import { searchSimilarChunks } from '@/lib/vectorStore';

export async function POST(req: Request) {
  try {
    const { messages, documentId }: { messages: CoreMessage[], documentId: string } = await req.json();

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'documentId is required' }), { status: 400 });
    }

    const userQuery = messages[messages.length - 1]?.content;
    if (!userQuery) {
      return new Response(JSON.stringify({ error: 'No user query found' }), { status: 400 });
    }

    // 1. Get relevant context from vector store
    const relevantChunks = await searchSimilarChunks(documentId, userQuery, { limit: 3 });
    const contextText = relevantChunks.map(chunk => chunk.content).join('\n\n---\n\n');

    // 2. Construct system prompt with context
    const systemPrompt = `You are an AI assistant for a PDF document.
Use the following context to answer the user's question:
${contextText}

If the context doesn't contain the answer, say so. Do not make up information.
---
Document Context:
${contextText}
---
`;

    // Prepend system message
    const messagesForLLM: CoreMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
    ];


    // 3. Generate response using Vercel AI SDK and OpenAI
    const result = await streamText({
      model: 'gpt-4o',
      messages: messagesForLLM,
      // TODO: Add other OpenAI parameters if needed (temperature, max_tokens, etc.)
    });

    // 4. Return the stream
    return result.toAIStreamResponse();

  } catch (error) {
    console.error('Chat API error:', error);
    let errorMessage = 'An error occurred in the chat API.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

// Ensure Edge runtime compatibility
export const runtime = 'edge';