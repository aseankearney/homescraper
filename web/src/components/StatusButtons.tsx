"use client";

import { Heart, ThumbsDown } from "lucide-react";
import { useState } from "react";

interface StatusButtonsProps {
  listingId: string;
  currentStatus: string;
  onUpdated: () => void;
}

export default function StatusButtons({
  listingId,
  currentStatus,
  onUpdated,
}: StatusButtonsProps) {
  const [submitting, setSubmitting] = useState(false);

  async function updateStatus(status: "love" | "nope") {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => updateStatus("love")}
        disabled={submitting}
        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
          currentStatus === "love"
            ? "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
            : "bg-gray-100 text-gray-700 hover:bg-pink-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-pink-900/25"
        }`}
      >
        <Heart className="h-3.5 w-3.5" />
        Love
      </button>
      <button
        onClick={() => updateStatus("nope")}
        disabled={submitting}
        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
          currentStatus === "nope"
            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            : "bg-gray-100 text-gray-700 hover:bg-red-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-red-900/25"
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
        Nope
      </button>
    </div>
  );
}
