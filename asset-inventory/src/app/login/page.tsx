"use client";

import { loginAs } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin(role: "admin" | "guest") {
    loginAs(role);
    router.push("/assets");
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-400">
        <div className="bg-white p-6 rounded shadow w-80">
            <h1 className="text-xl font-semibold mb-4 text-center">
                Login
            </h1>

            <button
                onClick={() => handleLogin("admin")}
                className="w-full mb-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Login as Admin
            </button>
            <button
                onClick={() => handleLogin("guest")}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
                Login as Guest
            </button>
        </div>
    </main>
    );
}