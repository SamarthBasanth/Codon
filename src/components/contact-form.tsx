"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";

export function ContactForm({ recipient }: { recipient: string }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-success/30 bg-success-muted/30 p-8 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-5 w-5" />
        </span>
        <p className="font-medium">Message sent to {recipient}</p>
        <p className="text-sm text-muted-foreground">
          This is a demo — no message actually left your browser.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-1 text-sm text-brand hover:underline cursor-pointer"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Your name" required />
        <Input type="email" placeholder="Your email" required />
      </div>
      <Input placeholder="Subject — e.g. commercial license inquiry" />
      <Textarea
        placeholder={`Message to ${recipient}…`}
        rows={4}
        required
      />
      <Button type="submit">
        <Send className="h-4 w-4" />
        Send message
      </Button>
    </form>
  );
}
