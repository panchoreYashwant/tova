"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold hover:text-gray-300">
          Home
        </Link>
        <div className="flex space-x-4">
          <Link href="/events" className="hover:text-gray-300">
            Events
          </Link>
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/profile" className="hover:text-gray-300">
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}
