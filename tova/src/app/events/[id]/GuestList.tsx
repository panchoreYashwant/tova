"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Guest = {
  id: string;
  name: string;
  email: string;
  checked_in: boolean;
};

type GuestListProps = {
  initialGuests: Guest[];
  eventId: string;
};

export default function GuestList({ initialGuests, eventId }: GuestListProps) {
  const [guests, setGuests] = useState(initialGuests);
  const router = useRouter();

  const handleCheckInToggle = async (guestId: string, checkedIn: boolean) => {
    const response = await fetch(`/api/guests/${guestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checked_in: checkedIn }),
    });

    if (response.ok) {
      setGuests(
        guests.map((g) =>
          g.id === guestId ? { ...g, checked_in: checkedIn } : g,
        ),
      );
      router.refresh();
    } else {
      alert("Failed to update check-in status.");
    }
  };

  return (
    <ul className="space-y-3">
      {guests.map((guest) => (
        <li
          key={guest.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
        >
          <div>
            <p className="font-medium">{guest.name}</p>
            <p className="text-sm text-gray-500">{guest.email}</p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={guest.checked_in}
              onChange={(e) => handleCheckInToggle(guest.id, e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm">
              {guest.checked_in ? "Checked In" : "Check In"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
