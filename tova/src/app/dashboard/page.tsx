import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCurrentUser, getUserEvents } from "@/app/actions";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const events = await getUserEvents();

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <ul>
          {events.map((event) => (
            <li key={event.id} className="mb-2">
              <a
                href={`/events/${event.id}`}
                className="text-blue-500 hover:underline"
              >
                {event.name} - {new Date(event.date).toLocaleDateString()}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
