import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/app/actions";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold">Home Page</div>
        {user ? (
          <div>
            <p>Welcome, {user.email}!</p>
            <Link href="/events" className="text-blue-600 hover:underline">
              Go to Events
            </Link>
          </div>
        ) : (
          <div>
            <p>Please log in to continue.</p>
            <Link href="/login" className="text-blue-600 hover:underline">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
