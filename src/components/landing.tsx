import Link from "next/link";

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to Auth Trial</h1>
      <Link href="/signin">
        <button className="px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition cursor-pointer">
          Login
        </button>
      </Link>
    </div>
  );
}
