"use client";
import { useEffect, useState } from "react";
import { addGuest, updateGuestCheckInStatus } from "./actions";
import CSVUploader from "./csv-uploader";

// Define the type for a single guest
type Guest = {
  id: number;
  name: string;
  email: string;
  checked_in: boolean;
};

// Define the type for the component's props
type EventDetailsClientProps = {
  event: {
    id: string;
    name: string;
    date: string;
  };
  guests: Guest[];
};

export default function EventDetailsClient({
  event,
  guests: initialGuests,
}: EventDetailsClientProps) {
  const [guests, setGuests] = useState(initialGuests);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("eventId", event.id);

    const result = await addGuest(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.duplicate) {
      setError("A guest with this email already exists for this event.");
    } else if (result.newGuest) {
      // Add the new guest to the list to update the UI
      setGuests((prevGuests) => [...prevGuests, result.newGuest as Guest]);
      // Clear the form fields
      setName("");
      setEmail("");
    }
  };

  const handleCheckInToggle = async (guest: Guest) => {
    const newStatus = !guest.checked_in;
    const result = await updateGuestCheckInStatus(
      guest.id,
      event.id,
      newStatus,
    );

    if (result.error) {
      // You might want to show an error to the user
      console.error(result.error);
    } else if (result.updatedGuest) {
      // Update the guest in the local state
      setGuests((prevGuests) =>
        prevGuests.map((g) =>
          g.id === guest.id ? { ...g, checked_in: newStatus } : g,
        ),
      );
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {event.name}
        </h1>
        <p className="mt-2 text-gray-600">
          Date:{" "}
          {new Date(event.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Guests</h2>
          {guests.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {guests.map((guest) => (
                <li
                  key={guest.id}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{guest.name}</p>
                    <p className="text-sm text-gray-500">{guest.email}</p>
                  </div>
                  <button
                    onClick={() => handleCheckInToggle(guest)}
                    className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      guest.checked_in
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {guest.checked_in ? "Checked In" : "Check In"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                No guests yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a guest using the form or import from a CSV file.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Guest</h2>
            <form
              onSubmit={handleAddGuest}
              className="mt-4 space-y-4 rounded-lg border bg-white p-6 shadow-sm"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Guest Name
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
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Guest Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Add Guest
                </button>
              </div>
            </form>
          </div>
          <CSVUploader eventId={event.id} />
        </div>
      </div>
    </main>
  );
}
