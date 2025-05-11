"use client";

import React from "react";
import { Message } from "ai";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  children?: React.ReactNode;
  isStreaming?: boolean;
}

export function MessageBubble({ message, children, isStreaming = false }: MessageBubbleProps) {
  const isUserMessage = message.role === "user";

  return (
    <div
      className={cn(
        "mb-4 flex",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUserMessage
            ? "bg-primary text-primary-foreground"
            : "bg-muted",
          isStreaming && "animate-pulse"
        )}
      >
        <div className="prose dark:prose-invert prose-sm">
          {message.content}
        </div>
        {children}
      </div>
    </div>
  );
}