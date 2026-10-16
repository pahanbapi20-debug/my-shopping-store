"use client";

import { BadgeCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Review } from "@/db/schema";
import { Stars } from "@/components/ui/stars";
import { toast } from "@/components/ui/toaster";
import { cn, timeAgo } from "@/lib/utils";

export function Reviews({
  productId,
  reviews,
  avgRating,
}: {
  productId: number;
  reviews: Review[];
  avgRating: number;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<number | null>(null);

  const dist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  const visible = filter ? reviews.filter((r) => r.rating === filter) : reviews;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: fd.get("author"),
          title: fd.get("title"),
          body: fd.get("body"),
          rating,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not submit review");
      }
      toast("Thanks! Your review has been posted.");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 className="font-serif text-3xl">Customer reviews</h2>
          <div className="mt-5 flex items-end gap-4">
            <span className="font-serif text-6xl leading-none">{avgRating ? avgRating.toFixed(1) : "—"}</span>
            <div className="pb-1">
              <Stars rating={avgRating} size="md" />
              <p className="mt-1 text-sm text-ink-600">
                Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-2">
            {dist.map((d) => (
              <li key={d.n}>
                <button
                  onClick={() => setFilter(filter === d.n ? null : d.n)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-1 text-sm transition hover:bg-cream-200",
                    filter === d.n && "bg-cream-200",
                  )}
                >
                  <span className="w-8 text-left text-ink-700">{d.n} ★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                    <span
                      className="block h-full rounded-full bg-gold-500 transition-all duration-700"
                      style={{ width: reviews.length ? `${(d.count / reviews.length) * 100}%` : 0 }}
                    />
                  </span>
                  <span className="w-6 text-right text-xs text-ink-500">{d.count}</span>
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowForm((s) => !s)} className="btn-outline mt-6 w-full">
            {showForm ? "Cancel" : "Write a review"}
          </button>
        </div>

        <div>
          {showForm && (
            <form onSubmit={submit} className="mb-8 rounded-2xl border border-cream-300 bg-white p-6 animate-scale-in">
              <h3 className="font-serif text-2xl">Share your thoughts</h3>
              <div className="mt-4">
                <span className="text-sm font-medium">Your rating</span>
                <div className="mt-2 flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      aria-label={`${n} stars`}
                      className="p-0.5"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition",
                          (hoverRating || rating) >= n ? "text-gold-500" : "text-cream-300",
                        )}
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <input name="author" required maxLength={100} placeholder="Your name" className="input" />
                <input name="title" required maxLength={160} placeholder="Review title" className="input" />
              </div>
              <textarea
                name="body"
                required
                minLength={10}
                rows={4}
                placeholder="What did you love? How was the fit?"
                className="input mt-4 resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary mt-4">
                {submitting ? "Posting…" : "Post review"}
              </button>
            </form>
          )}

          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cream-300 p-10 text-center text-ink-600">
              {filter ? `No ${filter}-star reviews yet.` : "No reviews yet — be the first to share your thoughts."}
            </div>
          ) : (
            <ul className="divide-y divide-cream-300">
              {visible.map((r, i) => (
                <li key={r.id} className={cn("py-6 animate-fade-up", `delay-${Math.min(i + 1, 6)}`)}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-terra-100 font-serif text-lg text-terra-700">
                        {r.author.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {r.author}
                          {r.verified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-700">
                              <BadgeCheck className="h-3.5 w-3.5" /> Verified buyer
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-500">{timeAgo(r.createdAt)}</p>
                      </div>
                    </div>
                    <Stars rating={r.rating} size="sm" />
                  </div>
                  <h4 className="mt-4 font-medium">{r.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
