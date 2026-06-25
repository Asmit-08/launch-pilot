"use client";
import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

import { useRouter } from "next/navigation";



export default function DashboardPage() {

const router = useRouter();
  

const [auditResult, setAuditResult] = useState<any>(null);
useEffect(() => {
  const storedAudit = localStorage.getItem("auditResult");

  if (!storedAudit) {
    router.replace("/audit");
    return;
  }

  setAuditResult(JSON.parse(storedAudit));
}, [router]);

const messagesEndRef = useRef<HTMLDivElement>(null);

const [message, setMessage] = useState("");

const [messages, setMessages] = useState<
  {
    role: string;
    content: string;
  }[]
>([]);

const [isTyping, setIsTyping] = useState(false);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

const handleSendMessage = async () => {

  if (!message.trim()) return;

  const userMessage = {
    role: "user",
    content: message,
  };

  const updatedMessages = [
    ...messages,
    userMessage,
  ];

  setMessages(updatedMessages);

  const currentMessage = message;

  setMessage("");

  setIsTyping(true);

  const response = await fetch(
    "http://launch-pilot-backend.onrender.com/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: currentMessage,
        audit_result: auditResult,
        startup_data: {},
        chat_history: updatedMessages,
      }),
    }
  );

  const data = await response.json();

  setIsTyping(false);

  setMessages([
    ...updatedMessages,
    {
      role: "assistant",
      content: data.response,
    },
  ]);
};


if (!auditResult) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading Report...
    </main>
  );
}

let launchStatus = "";

if (auditResult.overall_score >= 80) {
  launchStatus = "Ready To Launch";
}
else if (auditResult.overall_score >= 60) {
  launchStatus = "Promising";
}
else if (auditResult.overall_score >= 40) {
  launchStatus = "Needs Improvement";
}
else {
  launchStatus = "High Risk";
}


  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-5xl font-bold">
  Launch Report
</h1>

<p className="mt-3 text-zinc-400">
  Your AI-powered startup audit.
</p>

<Card className="mt-10 border-blue-500/20 transition-all duration-300 hover:border-blue-500/50">

  <CardContent className="py-12">

    <div className="text-center">

      <p className="text-sm uppercase tracking-widest text-zinc-500">
        Launch Score
      </p>

      <h2 className="mt-4 text-8xl font-bold text-blue-500">
        {auditResult.overall_score}
      </h2>

      <p className="mt-4 text-xl font-semibold text-blue-400">
        {launchStatus}
      </p>

      <p className="mt-2 text-zinc-400">
        AI-generated startup launch assessment
      </p>

    </div>

    <div className="mt-10 grid gap-4 md:grid-cols-4">

      <div className="rounded-xl border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-500">
          Product
        </p>

        <p className="mt-2 text-3xl font-bold">
          {auditResult.product.score}/10
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-500">
          Validation
        </p>

        <p className="mt-2 text-3xl font-bold">
          {auditResult.validation.score}/10
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-500">
          Launch
        </p>

        <p className="mt-2 text-3xl font-bold">
          {auditResult.launch_readiness.score}/10
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 p-4 text-center">
        <p className="text-sm text-zinc-500">
          Risk
        </p>

        <p className="mt-2 text-3xl font-bold">
          {auditResult.risk.score}/10
        </p>
      </div>

    </div>

  </CardContent>

</Card>

<div className="grid gap-8 mt-10 lg:grid-cols-2">

  <Card className="transition-all duration-300">
    <CardHeader>
      <CardTitle>📦 Product</CardTitle>
    </CardHeader>

<CardContent>

  <p className="mb-4 text-3xl font-bold">
    {auditResult.product.score}/10
  </p>

  <div className="mb-4">
    <h4 className="font-semibold mb-2">
      Strengths
    </h4>

    <ul className="space-y-2 text-zinc-400">
      {auditResult.product.strengths?.map(
        (strength: string, index: number) => (
          <li key={index}>
            • {strength}
          </li>
        )
      )}
    </ul>
  </div>

  <div>
    <h4 className="font-semibold mb-2">
      Weaknesses
    </h4>

    <ul className="space-y-2 text-zinc-400">
      {auditResult.product.weaknesses?.map(
        (weakness: string, index: number) => (
          <li key={index}>
            • {weakness}
          </li>
        )
      )}
    </ul>
  </div>

</CardContent>
  </Card>


  <Card className="transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1">
    <CardHeader>
      <CardTitle>📈 Validation</CardTitle>
    </CardHeader>

    <CardContent>

      <p className="mb-4 text-3xl font-bold">
        {auditResult.validation.score}/10
      </p>

      <div className="mb-4">
        <h4 className="mb-2 font-semibold">
          Strengths
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.validation.strengths?.map(
            (strength: string, index: number) => (
              <li key={index}>
                • {strength}
              </li>
            )
          )}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">
          Weaknesses
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.validation.weaknesses?.map(
            (weakness: string, index: number) => (
              <li key={index}>
                • {weakness}
              </li>
            )
          )}
        </ul>
      </div>

    </CardContent>
  </Card>

  <Card className="transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1">
    <CardHeader>
      <CardTitle>🚀 Launch Readiness</CardTitle>
    </CardHeader>

    <CardContent>

      <p className="mb-4 text-3xl font-bold">
        {auditResult.launch_readiness.score}/10
      </p>

      <div className="mb-4">
        <h4 className="mb-2 font-semibold">
          Strengths
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.launch_readiness.strengths?.map(
            (strength: string, index: number) => (
              <li key={index}>
                • {strength}
              </li>
            )
          )}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">
          Weaknesses
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.launch_readiness.weaknesses?.map(
            (weakness: string, index: number) => (
              <li key={index}>
                • {weakness}
              </li>
            )
          )}
        </ul>
      </div>

    </CardContent>
  </Card>

  <Card className="transition-all duration-300 hover:border-blue-500/30 hover:-translate-y-1">
    <CardHeader>
      <CardTitle>⚠️ Risk Analysis</CardTitle>
    </CardHeader>

    <CardContent>

      <p className="mb-4 text-3xl font-bold">
        {auditResult.risk.score}/10
      </p>

      <div className="mb-4">
        <h4 className="mb-2 font-semibold">
          Critical Risks
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.risk.critical_risks?.map(
            (risk: any, index: number) => (
              <li key={index}>
                • {risk.risk}
              </li>
            )
          )}
        </ul>
      </div>

      <div>
        <h4 className="mb-2 font-semibold">
          Mitigation
        </h4>

        <ul className="space-y-2 text-zinc-400">
          {auditResult.risk.mitigation?.map(
            (item: any, index: number) => (
              <li key={index}>
                • {item.strategy}
              </li>
            )
          )}
        </ul>
      </div>

    </CardContent>
  </Card>
</div>

  <Card className="mt-10">

  <CardHeader>
    <CardTitle>
      🎯 Top Priorities
    </CardTitle>
  </CardHeader>

  <CardContent>

    <div className="space-y-4">

      {auditResult.product.weaknesses
        ?.slice(0, 1)
        .map((item: string, index: number) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-blue-500/30"
          >
            <div>

  <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-400">
    Priority 1
  </span>

  <p className="mt-2 text-xs uppercase tracking-wide text-zinc-500">
    Most Critical
  </p>

</div>

            <p className="mt-2 text-zinc-400">
              {item}
            </p>
          </div>
        ))}

      {auditResult.validation.weaknesses
        ?.slice(0, 1)
        .map((item: string, index: number) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-blue-500/30"
          >
            <div>

  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-400">
    Priority 2
  </span>

  <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">
    Important
  </p>

</div>

            <p className="mt-2 text-zinc-400">
              {item}
            </p>
          </div>
        ))}

      {auditResult.launch_readiness.weaknesses
        ?.slice(0, 1)
        .map((item: string, index: number) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-blue-500/30"
          >
            <div>

  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
    Priority 3
  </span>

  <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">
    Should Improve
  </p>

</div>

            <p className="mt-2 text-zinc-400">
              {item}
            </p>
          </div>
        ))}

      {auditResult.risk.critical_risks
        ?.slice(0, 1)
        .map((item: any, index: number) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-blue-500/30"
          >
            <div>

  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
    Priority 4
  </span>

  <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500">
    Monitor
  </p>

</div>

            <p className="mt-2 text-zinc-400">
              {item.risk}
            </p>
          </div>
        ))}

    </div>

  </CardContent>

</Card>

  <Card className="mt-10">
  <CardHeader>
    <CardTitle>
      AI Co-Founder
    </CardTitle>
  </CardHeader>

  <CardContent>

    <div className="mb-6 h-96 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4">

      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center">

  <div className="mb-4 text-5xl">
    🤖
  </div>

  <p className="text-2xl font-semibold text-white">
    AI Co-Founder
  </p>

  <p className="mt-3 max-w-md text-zinc-400">
    Get personalized advice based on your
    audit report, startup data, validation,
    pricing strategy, and launch readiness.
  </p>

  <p className="mt-4 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
    Powered by Launch Pilot AI
  </p>
  <div className="mt-8 text-left">

  <p className="mb-3 text-sm font-semibold text-zinc-400">
    💡 Try asking:
  </p>

  <div className="space-y-2 text-sm text-zinc-500">

    <p>• What is my biggest risk?</p>

    <p>• How can I improve validation?</p>

    <p>• How should I launch my startup?</p>

    <p>• How can I get my first 100 users?</p>

  </div>

</div>

</div>
            )}

      {messages.map((msg, index) => (
      <div
        key={index}
        className={`mb-4 flex ${
          msg.role === "user"
            ? "justify-end"
            : "justify-start"
        }`}
      >

        <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
          msg.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-zinc-900 border border-zinc-800 text-zinc-100"
        }`}
      >
        <ReactMarkdown>
          {msg.content}
        </ReactMarkdown>
      </div>

      </div>
    ))}

    {isTyping && (
      <div className="mb-4 flex justify-start">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
  🤖 Thinking...
</div>
      </div>
    )}
<div ref={messagesEndRef} />

    </div>

    <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">

      <Input
      placeholder="Ask anything about your startup..."
      value={message}
      onChange={(e) =>
        setMessage(e.target.value)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSendMessage();
        }
      }}
    />

      <Button
        size="icon"
        onClick={handleSendMessage}
      >
        <Send className="h-4 w-4" />
      </Button>

    </div>

  </CardContent>
</Card>

      </div>
    </main>
  );
}