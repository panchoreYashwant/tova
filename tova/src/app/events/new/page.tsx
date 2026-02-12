"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function NewEventPage() {
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!date) {
      setError("Please select an event date.");
      return;
    }

    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date: date.toISOString() }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || "Failed to create event.");
      return;
    }

    router.push("/events");
    router.refresh();
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create a New Event</h1>
          <p className="mt-2 text-gray-600">Fill out the details below to set up your new event.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Event Date
            </label>
            <DatePicker
              id="date"
              selected={date}
              onChange={(date: Date | null) => setDate(date)}
              required
              className="mt-1 block w-full"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Event
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
