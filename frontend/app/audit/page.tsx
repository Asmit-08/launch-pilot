"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";




export default function AuditPage() {

  const router = useRouter();

  const [loading, setLoading] = useState(false);

const [loadingMessage, setLoadingMessage] = useState(
  "Analyzing Product..."
);

  const [formData, setFormData] = useState({
    product_name: "",
    one_line_pitch: "",
    description: "",

    target_audience: "",
    competitors: "",
    unique_value_proposition: "",

    beta_users: 0,
    feedback_collected: false,

    mvp_completed: false,
    critical_bugs: false,

    landing_page: false,
    demo_video: false,
    social_media_presence: false,

    waitlist: false,
    launch_channels: "",

    budget: 0,
    currency: "USD",
    pricing_model: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
    [name]:
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value,
    }))};

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    setLoadingMessage("Analyzing Product...");

    setTimeout(() => {
      setLoadingMessage("Checking Validation...");
    }, 1500);

    setTimeout(() => {
      setLoadingMessage("Assessing Launch Readiness...");
    }, 3000);

    setTimeout(() => {
      setLoadingMessage("Identifying Risks...");
    }, 4500);

    setTimeout(() => {
      setLoadingMessage("Generating Report...");
  }, 6000);
    const payload = {
      ...formData,


      competitors: formData.competitors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      launch_channels: formData.launch_channels
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
        
    };
    const response = await fetch(
  "http://127.0.0.1:8000/audit",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

const result = await response.json();

localStorage.setItem(
  "auditResult",
  JSON.stringify(result)
);

router.push("/dashboard");

  
  };

    if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">

          <h1 className="text-6xl font-bold">
            Launch <span className="text-blue-500">Pilot</span>
          </h1>

          <p className="mt-6 text-xl text-zinc-400">
            {loadingMessage}         
          </p>
          <p className="mt-3 text-zinc-500">
            AI agents are preparing your startup audit...
          </p>

          <div className="mt-10 w-80">

            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">

              <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />

            </div>

          </div>

        </div>
        <div className="mt-8 space-y-2 text-left">

  <p className="text-zinc-400">
    {loadingMessage !== "Analyzing Product..."
      ? "✅ Product Analysis Complete"
      : "⏳ Product Analysis"}
  </p>

  <p className="text-zinc-400">
    {loadingMessage === "Assessing Launch Readiness..." ||
     loadingMessage === "Identifying Risks..." ||
     loadingMessage === "Generating Report..."
      ? "✅ Validation Analysis Complete"
      : "⏳ Validation Analysis"}
  </p>

  <p className="text-zinc-400">
    {loadingMessage === "Identifying Risks..." ||
     loadingMessage === "Generating Report..."
      ? "✅ Launch Readiness Complete"
      : "⏳ Launch Readiness"}
  </p>

  <p className="text-zinc-400">
    {loadingMessage === "Generating Report..."
      ? "✅ Risk Analysis Complete"
      : "⏳ Risk Analysis"}
  </p>

</div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">

        <h1 className="text-5xl font-bold">
          Launch Audit
        </h1>

        <p className="mt-3 text-zinc-400">
          Tell Launch Pilot about your startup.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="font-medium">
            Estimated completion time: 2-3 minutes
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Our AI agents will evaluate your product, validation,
            launch readiness, and business risks.
          </p>
        </div>
              <form
        className="space-y-8"
        onSubmit={handleSubmit}
      >

        {/* Product Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 Product</CardTitle>
            <p className="text-sm text-zinc-500">
    Tell us what you're building.
  </p>
          </CardHeader>

          <CardContent className="space-y-4">

            <div>
              <Label>Product Name</Label>
              <Input
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>One Line Pitch</Label>
              <Input
                name="one_line_pitch"
                value={formData.one_line_pitch}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

          </CardContent>
        </Card>

        <Card className="mt-6">
  <CardHeader>
    <CardTitle>🎯 Market</CardTitle>
    <p className="text-sm text-zinc-500">
    Describe your audience and competitors.
  </p>
  </CardHeader>

  <CardContent className="space-y-4">

    <div>
      <Label>Target Audience</Label>
      <Input
        name="target_audience"
        value={formData.target_audience}
        onChange={handleChange}
        placeholder="SaaS Founders, Indie Hackers"
      />
    </div>

    <div>
      <Label>Competitors</Label>
      <Textarea
        name="competitors"
        value={formData.competitors}
        onChange={handleChange}
        placeholder="Product Hunt, Indie Hackers, StartupBolt"
      />
    </div>

    <div>
      <Label>Unique Value Proposition</Label>
      <Textarea
        name="unique_value_proposition"
        value={formData.unique_value_proposition}
        onChange={handleChange}
        placeholder="What makes your product different?"
      />
    </div>

  </CardContent>
</Card>

<Card className="mt-6">
  <CardHeader>
    <CardTitle>📈 Validation</CardTitle>
    <p className="text-sm text-zinc-500">
    Show evidence that user wants it.
  </p>
  </CardHeader>

  <CardContent className="space-y-6">

    <div>
      <Label>Beta Users</Label>

      <Input
        type="number"
        name="beta_users"
        value={formData.beta_users}
        onChange={handleChange}
        placeholder="25"
      />
    </div>

    <div className="flex items-center gap-3">

      <input
        type="checkbox"
        name="feedback_collected"
        checked={formData.feedback_collected}
        onChange={handleChange}
      />

      <Label>
        Feedback Collected
      </Label>

    </div>

  </CardContent>
</Card>

<Card className="mt-6">
  <CardHeader>
    <CardTitle>🛠 Product Status</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">

    <div className="flex items-center gap-3">

      <input
        type="checkbox"
        name="mvp_completed"
        checked={formData.mvp_completed}
        onChange={handleChange}
      />

      <Label>
        MVP Completed
      </Label>

    </div>

    <div className="flex items-center gap-3">

      <input
        type="checkbox"
        name="critical_bugs"
        checked={formData.critical_bugs}
        onChange={handleChange}
      />

      <Label>
        Critical Bugs Present
      </Label>

    </div>

  </CardContent>
</Card>

<Card className="mt-6">
  <CardHeader>
    <CardTitle>📢 Marketing</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">

    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name="landing_page"
        checked={formData.landing_page}
        onChange={handleChange}
      />

      <Label>
        Landing Page Ready
      </Label>
    </div>

    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name="demo_video"
        checked={formData.demo_video}
        onChange={handleChange}
      />

      <Label>
        Demo Video Ready
      </Label>
    </div>

    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name="social_media_presence"
        checked={formData.social_media_presence}
        onChange={handleChange}
      />

      <Label>
        Social Media Presence
      </Label>
    </div>

  </CardContent>
</Card>

<Card className="mt-6">
  <CardHeader>
    <CardTitle>🌍 Distribution</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">

    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name="waitlist"
        checked={formData.waitlist}
        onChange={handleChange}
      />

      <Label>
        Waitlist Created
      </Label>
    </div>

    <div>
      <Label>Launch Channels</Label>

      <Textarea
        name="launch_channels"
        value={formData.launch_channels}
        onChange={handleChange}
        placeholder="Product Hunt, LinkedIn, Reddit"
      />
    </div>

  </CardContent>
</Card>

<Card className="mt-6">
  <CardHeader>
    <CardTitle>💰 Business</CardTitle>
    <p className="text-sm text-zinc-500">
    Revenue, pricing, and financial planning.
  </p>
  </CardHeader>

  <CardContent className="space-y-4">

    <div>
      <Label>Budget</Label>

      <Input
        type="number"
        name="budget"
        value={formData.budget}
        onChange={handleChange}
        placeholder="500"
      />
    </div>

    <div>
      <Label>Currency</Label>

      <Input
        name="currency"
        value={formData.currency}
        onChange={handleChange}
        placeholder="USD"
      />
    </div>

    <div>
      <Label>Pricing Model</Label>

      <Input
        name="pricing_model"
        value={formData.pricing_model}
        onChange={handleChange}
        placeholder="Freemium"
      />
    </div>

  </CardContent>
</Card>

<Button
  size="lg"
  className="w-full mt-8"
>
  🚀 Run Launch Audit
</Button>
</form>

      </div>
    </main>
  );
  }