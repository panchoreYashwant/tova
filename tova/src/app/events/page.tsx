import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCurrentUser, getUserEvents } from "@/app/actions";

export const revalidate = 0;

export default async function EventsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const events = await getUserEvents();

  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Events</h1>
          <a
            href="/events/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add New Event
          </a>
        </div>
        
        {events.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <h2 className="text-lg font-semibold text-gray-900">{event.name}</h2>
                <p className="mt-2 text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">No events found.</h2>
            <p className="mt-2 text-gray-500">Get started by creating your first event.</p>
          </div>
        )}
      </main>
    </>
  );
}
