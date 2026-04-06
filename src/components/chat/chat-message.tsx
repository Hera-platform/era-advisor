"use client";

import { cn } from "@/lib/utils";
import { ToolResultCard } from "./tool-result-card";
import type { ToolResult } from "./chat-container";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
}

export function ChatMessage({ role, content, toolResults }: ChatMessageProps) {
  // Clean up any "Researching..." placeholders once we have tool results
  let displayContent = content;
  if (toolResults && toolResults.length > 0) {
    displayContent = displayContent.replace(
      /\n\n\*Researching your company\.\.\.\*\n/g,
      ""
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col w-full",
        role === "user" ? "items-end" : "items-start"
      )}
    >
      {/* Text bubble */}
      {displayContent.trim() && (
        <div
          className={cn(
            "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
            role === "user"
              ? "bg-gold/90 text-navy rounded-br-md"
              : "bg-navy-lighter text-foreground rounded-bl-md"
          )}
        >
          <div className="whitespace-pre-wrap">{displayContent}</div>
        </div>
      )}

      {/* Tool result cards */}
      {toolResults &&
        toolResults.map((tr, idx) => (
          <div key={idx} className="w-full max-w-[85%] md:max-w-[75%]">
            <ToolResultCard toolName={tr.toolName} result={tr.result} />
          </div>
        ))}
    </div>
  );
}
