"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "@/components/ui/toaster";

export function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast("Please enter a valid email", "error");
      return;
    }
    setDone(true);
    toast("You're on the list — welcome to the family!");
  };

  if (done) {
    return (
      <p className={`text-sm ${dark ? "text-cream-200" : "text-ink-700"}`}>
        Thanks! Check your inbox for <strong>WELCOME15</strong>.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className={`flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition ${
          dark
            ? "border-ink-700 bg-ink-800 text-cream-50 placeholder:text-ink-500 focus:border-cream-300"
            : "border-cream-300 bg-white text-ink-900 placeholder:text-ink-400 focus:border-ink-800"
        }`}
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
          dark ? "bg-cream-50 text-ink-900 hover:bg-gold-400" : "bg-ink-900 text-cream-50 hover:bg-terra-600"
        }`}
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
