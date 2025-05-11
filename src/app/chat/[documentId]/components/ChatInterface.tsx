'use client';

import { useChat, type Message } from 'ai/react';
import { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/chat/MessageBubble';

interface ChatInterfaceProps {
  documentId: string;
  // initialMessages?: Message[]; // If you want to load previous messages
}

export function ChatInterface({ documentId }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat', // Your backend route for chat
    body: {
      documentId, // Send documentId with each request
    },
    // initialMessages: initialMessages, // Pass initial messages if any
    onFinish: (message) => {
      // TODO: Potentially process citations or other metadata from the finished message
      console.log('Stream finished. Final message:', message);
    },
    onError: (err) => {
      console.error('Chat error:', err);
      // TODO: Display user-friendly error message in the UI
    }
  });

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // TODO: Implement fetching and setting initial messages if needed
  // useEffect(() => {
  //   async function fetchInitialMessages() {
  //     // const response = await fetch(`/api/chat/history?documentId=${documentId}`);
  //     // const data = await response.json();
  //     // setMessages(data.messages);
  //   }
  //   fetchInitialMessages();
  // }, [documentId, setMessages]);


  const customHandleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Any custom logic before submitting can go here
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] w-full max-w-2xl mx-auto">
      <ScrollArea className="flex-grow p-4 border rounded-md mb-4" ref={scrollAreaRef}>
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground">
            Ask something about the document!
          </p>
        )}
        {messages.map((m: Message) => (
          <MessageBubble key={m.id} message={m}>
            {/* TODO: Implement citation display logic if AI provides citation markers */}
            {/* e.g. m.annotations?.map(anno => <CitationBadge ... />) */}
          </MessageBubble>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length -1].role === 'user' && (
          <MessageBubble message={{id: 'loading', role: 'assistant', content: 'Thinking...'}} isStreaming />
        )}
      </ScrollArea>
      {error && (
        <div className="p-2 mb-2 text-sm text-red-700 bg-red-100 rounded-md">
          <p><strong>Error:</strong> {error.message || 'Failed to get response.'}</p>
          {/* Consider providing a retry mechanism or more details */}
        </div>
      )}
      <form onSubmit={customHandleSubmit} className="flex items-center gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about the PDF..."
          className="flex-grow"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}