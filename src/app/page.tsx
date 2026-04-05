import { ChatContainer } from "@/components/chat/chat-container";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero — compact, scrolls away as conversation grows */}
      <header className="w-full px-4 pt-10 pb-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="text-gold font-bold text-2xl tracking-tight">
              ERA
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-white leading-tight mb-4">
            Sell your business with AI
          </h1>
          <p className="text-gray-text text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Tell ERA your company name. We&apos;ll research your business,
            prepare institutional-quality materials, and connect you with the
            right buyers. No upfront fees.
          </p>

          {/* How it works — 3 steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <Step number="1" label="Talk to ERA" />
            <Connector />
            <Step number="2" label="Materials generated" />
            <Connector />
            <Step number="3" label="Matched with buyers" />
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="h-px bg-white/10" />
      </div>

      {/* Chat — the product */}
      <main className="flex flex-col flex-1">
        <ChatContainer />
      </main>
    </div>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold text-xs font-semibold">
        {number}
      </div>
      <span className="text-sm text-gray-text">{label}</span>
    </div>
  );
}

function Connector() {
  return (
    <div className="hidden sm:block w-8 h-px bg-white/10" />
  );
}
