import { OpenAI } from 'openai';
import { streamText } from 'ai';
import { openai } from './openai'; // Your configured OpenAI client instance
import { searchSimilarChunks } from './vectorStore';
import { CoreMessage } from 'ai';

// TODO: Fill in your OpenAI API Key in .env
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set.');
}

interface RagContext {
  documentId: string;
  userQuery: string;
  chatHistory?: CoreMessage[]; // Optional chat history for more context
}

export async function getRagResponse(context: RagContext, { stream }: { stream: boolean }) {
  const { documentId, userQuery, chatHistory = [] } = context;

  // 1. Search for relevant chunks in Supabase (pgvector)
  const relevantChunks = await searchSimilarChunks(documentId, userQuery, { limit: 5 }); // Example limit

  if (!relevantChunks || relevantChunks.length === 0) {
    // Handle cases with no relevant chunks (e.g., fallback response)
    if (stream) {
        const noContextStream = new ReadableStream({
            start(controller) {
                controller.enqueue("I couldn't find any specific information about that in the document. Can I help with something else?");
                controller.close();
            }
        });
        return noContextStream; // This needs to be a Vercel AI SDK compatible stream
    }
    return "I couldn't find any specific information about that in the document. Can I help with something else?";
  }

  // 2. Construct the prompt for the LLM
  const contextText = relevantChunks.map(chunk => chunk.content).join('\n\n---\n\n');
  const systemPrompt = `You are a helpful AI assistant. You are interacting with a user who has uploaded a PDF document.
  Use the following pieces of context from the document to answer the user's question.
  If you don't know the answer based on the provided context, just say that you don't know, don't try to make up an answer.
  Keep the answer concise and relevant to the query.
  Always cite the source of your information if it comes from the context by referencing the chunks or page numbers if available.

  Context from the document:
  ${contextText}
  `;

  const messages: CoreMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory, // Include past messages for conversational context
    { role: 'user', content: userQuery },
  ];

  // 3. Call OpenAI API and stream the response
  if (stream) {
    const result = await streamText({
      model: 'gpt-4o',
      messages,
      // TODO: Add temperature, max_tokens, etc. as needed
      // temperature: 0.7,
    });
    return result.toAIStream(); // Return the Vercel AI SDK stream
  } else {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[], // Cast for OpenAI SDK
      // temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  }
}