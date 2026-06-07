"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  

const [auditResult, setAuditResult] = useState<any>(null);
useEffect(() => {
  const storedAudit = localStorage.getItem("auditResult");

  if (storedAudit) {
    setAuditResult(JSON.parse(storedAudit));
  }
}, []);

const [message, setMessage] = useState("");

const [messages, setMessages] = useState<
  {
    role: string;
    content: string;
  }[]
>([]);

if (!auditResult) {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      Loading Report...
    </main>
  );
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

<Card className="mt-10">
  <CardHeader>
    <CardTitle>
      Overall Score
    </CardTitle>
  </CardHeader>

  <CardContent>
    <h2 className="text-6xl font-bold">
      {auditResult.overall_score}
    </h2>
  </CardContent>
</Card>

<div className="grid gap-8 mt-10 lg:grid-cols-2">

  <Card>
    <CardHeader>
      <CardTitle>Product</CardTitle>
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

  <Card>
    <CardHeader>
      <CardTitle>Validation</CardTitle>
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

  <Card>
    <CardHeader>
      <CardTitle>Launch Readiness</CardTitle>
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

  <Card>
    <CardHeader>
      <CardTitle>Risk Analysis</CardTitle>
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
            (risk: string, index: number) => (
              <li key={index}>
                • {risk}
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
            (item: string, index: number) => (
              <li key={index}>
                • {item}
              </li>
            )
          )}
        </ul>
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

    <div className="mb-6 h-80 overflow-y-auto rounded-lg border p-4">

      {messages.length === 0 && (
        <p className="text-zinc-500">
          Ask me anything about your startup.
        </p>
      )}

      {messages.map((msg, index) => (
        <div
          key={index}
          className="mb-4"
        >
          <p className="font-semibold">
            {msg.role === "user"
              ? "You"
              : "AI Co-Founder"}
          </p>

          <p className="text-zinc-400">
            {msg.content}
          </p>
        </div>
      ))}

    </div>

    <div className="flex gap-3">

      <Input
        placeholder="Ask about your startup..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <Button>
        Send
      </Button>

    </div>

  </CardContent>
</Card>

</div>
      </div>
    </main>
  );
}