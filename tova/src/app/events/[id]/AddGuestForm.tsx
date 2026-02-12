"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddGuestFormProps = {
  eventId: string;
};

export default function AddGuestForm({ eventId }: AddGuestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are required.");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!eventId) {
      setError("Event ID is missing. Please refresh and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          name: trimmedName,
          email: trimmedEmail,
        }),
      });

      if (response.ok) {
        setName("");
        setEmail("");
        router.refresh();
      } else {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || "Failed to add guest. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="guest-name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="guest-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label
          htmlFor="guest-email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="guest-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isSubmitting ? "Adding..." : "Add Guest"}
      </button>
    </form>
  );
}
