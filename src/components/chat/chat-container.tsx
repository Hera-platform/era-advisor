"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

export interface ToolResult {
  toolName: string;
  result: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to ERA. I'm your AI M&A advisor.\n\nTell me your company name and I'll start researching your business — financials, market position, competitive landscape. From there, I'll prepare institutional-quality materials to present your company to potential buyers.\n\nNo fees upfront. Let's start.",
};

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build messages for API — only role + content, skip welcome
      const apiMessages = [
        ...messages.filter((m) => m.id !== "welcome"),
        userMessage,
      ].map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      // Track the current assistant message being built
      const assistantId = (Date.now() + 1).toString();
      let accumulatedContent = "";
      const accumulatedToolResults: ToolResult[] = [];

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      if (reader) {
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;

            // Vercel AI SDK Data Stream Protocol
            // 0: text delta
            if (line.startsWith("0:")) {
              try {
                const text = JSON.parse(line.slice(2));
                accumulatedContent += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              } catch {
                // skip unparseable
              }
            }

            // a: tool result
            if (line.startsWith("a:")) {
              try {
                const parsed = JSON.parse(line.slice(2));
                if (parsed && parsed.length >= 2) {
                  const toolResult: ToolResult = {
                    toolName: parsed[0]?.toolName || "unknown",
                    result:
                      typeof parsed[0]?.result === "string"
                        ? JSON.parse(parsed[0].result)
                        : parsed[0]?.result || {},
                  };
                  accumulatedToolResults.push(toolResult);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            toolResults: [...accumulatedToolResults],
                          }
                        : m
                    )
                  );
                }
              } catch {
                // Try alternate format
                try {
                  const parsed = JSON.parse(line.slice(2));
                  if (parsed?.toolName && parsed?.result) {
                    const toolResult: ToolResult = {
                      toolName: parsed.toolName,
                      result:
                        typeof parsed.result === "string"
                          ? JSON.parse(parsed.result)
                          : parsed.result,
                    };
                    accumulatedToolResults.push(toolResult);
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId
                          ? {
                              ...m,
                              toolResults: [...accumulatedToolResults],
                            }
                          : m
                      )
                    );
                  }
                } catch {
                  // skip
                }
              }
            }

            // 9: tool call start (we can show a loading state)
            if (line.startsWith("9:")) {
              try {
                const parsed = JSON.parse(line.slice(2));
                const toolName = parsed?.toolName || parsed?.[0]?.toolName;
                if (toolName === "run_enrichment") {
                  // Show a temporary "researching" indicator
                  accumulatedContent += "\n\n*Researching your company...*\n";
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: accumulatedContent }
                        : m
                    )
                  );
                }
              } catch {
                // skip
              }
            }

            // 3: error
            if (line.startsWith("3:")) {
              try {
                const errorMsg = JSON.parse(line.slice(2));
                accumulatedContent +=
                  "\n\nI encountered an issue. Please try again.";
                console.error("Stream error:", errorMsg);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulatedContent }
                      : m
                  )
                );
              } catch {
                // skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please check that your API key is configured and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto">
      {/* Messages */}
      <div className="flex-1 flex flex-col gap-4 px-4 py-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            toolResults={message.toolResults}
          />
        ))}
        {isLoading &&
          messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-navy-lighter rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-text/60 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-text/60 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-text/60 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-gradient-to-t from-navy from-80% to-transparent px-4 pb-6 pt-4">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <p className="text-center text-xs text-gray-text/50 mt-3">
          ERA is an AI advisor. Information should be verified independently.
        </p>
      </div>
    </div>
  );
}
