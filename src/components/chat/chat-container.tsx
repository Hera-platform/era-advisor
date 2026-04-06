"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { AuthGate, type AuthGateTrigger } from "./auth-gate";
import { useAuth } from "@/hooks/use-auth";
import {
  getOrCreateSessionToken,
  getStoredSellerId,
  setStoredSellerId,
  getStoredDealId,
  setStoredDealId,
} from "@/lib/session";

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

  // Session & deal state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [dealId, setDealId] = useState<string | null>(null);

  // Auth gate
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateTrigger, setAuthGateTrigger] =
    useState<AuthGateTrigger>("deal_created");

  // Auth state
  const { user } = useAuth();

  // Initialize session from localStorage + load existing conversation
  useEffect(() => {
    const token = getOrCreateSessionToken();
    setSessionToken(token);
    setSellerId(getStoredSellerId());
    setDealId(getStoredDealId());

    // Try to reload conversation from server
    fetch(`/api/conversation?session_token=${token}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.conversation?.messages?.length > 0) {
          const restored: Message[] = data.conversation.messages.map(
            (m: { role: string; content: string }, i: number) => ({
              id: `restored-${i}`,
              role: m.role as "user" | "assistant",
              content: m.content,
            })
          );
          setMessages([WELCOME_MESSAGE, ...restored]);
        }
      })
      .catch(() => {/* ignore — fresh session */});
  }, []);

  // When user authenticates, resolve seller_id from server
  useEffect(() => {
    if (user) {
      setShowAuthGate(false);
      fetch("/api/seller/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.seller_id) {
            setSellerId(data.seller_id);
            setStoredSellerId(data.seller_id);
          }
        })
        .catch(console.error);
    }
  }, [user]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || !sessionToken) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = [
        ...messages.filter((m) => m.id !== "welcome"),
        userMessage,
      ].map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          session_token: sessionToken,
          seller_id: sellerId,
          deal_id: dealId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantId = (Date.now() + 1).toString();
      let accumulatedContent = "";
      const accumulatedToolResults: ToolResult[] = [];

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
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;

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
                /* skip */
              }
            }

            // a: tool result
            if (line.startsWith("a:")) {
              try {
                const parsed = JSON.parse(line.slice(2));
                // Try array format first, then object format
                const toolData = Array.isArray(parsed) ? parsed[0] : parsed;
                if (toolData?.toolName) {
                  const toolResult: ToolResult = {
                    toolName: toolData.toolName,
                    result:
                      typeof toolData.result === "string"
                        ? JSON.parse(toolData.result)
                        : toolData.result || {},
                  };
                  accumulatedToolResults.push(toolResult);
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, toolResults: [...accumulatedToolResults] }
                        : m
                    )
                  );
                }
              } catch {
                /* skip */
              }
            }

            // 9: tool call start
            if (line.startsWith("9:")) {
              try {
                const parsed = JSON.parse(line.slice(2));
                const toolName = Array.isArray(parsed)
                  ? parsed[0]?.toolName
                  : parsed?.toolName;
                if (toolName === "run_enrichment") {
                  accumulatedContent +=
                    "\n\n*Researching your company...*\n";
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: accumulatedContent }
                        : m
                    )
                  );
                }
              } catch {
                /* skip */
              }
            }

            // 3: error
            if (line.startsWith("3:")) {
              accumulatedContent +=
                "\n\nI encountered an issue. Please try again.";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: accumulatedContent }
                    : m
                )
              );
            }
          }
        }
      }

      // After stream ends: check for new deal creation
      const createDealResult = accumulatedToolResults.find(
        (tr) => tr.toolName === "create_deal"
      );
      if (createDealResult?.result?.deal_id && !dealId) {
        const newDealId = createDealResult.result.deal_id as string;
        setStoredDealId(newDealId);
        setDealId(newDealId);

        // Fetch the seller_id created server-side (retry once after short delay
        // since onFinish may not have persisted yet)
        const fetchSellerId = async (retries = 2): Promise<void> => {
          const syncRes = await fetch(
            `/api/session/sync?session_token=${sessionToken}`
          );
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.seller_id) {
              setStoredSellerId(syncData.seller_id);
              setSellerId(syncData.seller_id);
              return;
            }
          }
          if (retries > 0) {
            await new Promise((r) => setTimeout(r, 1000));
            return fetchSellerId(retries - 1);
          }
        };
        await fetchSellerId();

        // Show auth gate if user is anonymous
        if (!user) {
          setAuthGateTrigger("deal_created");
          setShowAuthGate(true);
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
            isAuthenticated={!!user}
            onDownload={() => {
              if (!user) {
                setAuthGateTrigger("download_request");
                setShowAuthGate(true);
              }
            }}
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

      {/* Auth gate — appears above input when triggered */}
      {showAuthGate && !user && (
        <div className="px-4 pb-2">
          <AuthGate
            trigger={authGateTrigger}
            sellerId={sellerId}
            sessionToken={sessionToken}
            onSuccess={() => setShowAuthGate(false)}
            onDismiss={() => setShowAuthGate(false)}
          />
        </div>
      )}

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
