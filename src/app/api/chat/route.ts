import { NextRequest } from "next/server";

// Placeholder chat endpoint — will be replaced with Claude in B2
export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // Simple placeholder response
  const response = `I received your message: "${lastMessage?.content}"\n\nThis is a placeholder response. The AI advisor (powered by Claude) will be connected in the next step.`;

  // Stream the response using Vercel AI SDK text stream protocol
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send as a single text delta (Vercel AI SDK format: 0:"text")
      controller.enqueue(
        encoder.encode(`0:${JSON.stringify(response)}\n`)
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
