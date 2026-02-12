import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/app/actions";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-gray-700">Email: {user.email}</p>
        <form action="/api/auth/signout" method="post" className="mt-6">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Log out
          </button>
        </form>
      </div>
    </>
  );
}
