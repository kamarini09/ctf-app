import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-3 text-3xl font-bold">Welcome to the CTF</h1>
      <p className="mb-6 text-gray-600">Read the rules, join a team, and start solving!</p>
      <div className="flex gap-3">
        <Link href="/rules" className="rounded bg-gray-900 px-4 py-2 text-white">
          Rules
        </Link>
        <Link href="/challenges" className="rounded bg-blue-600 px-4 py-2 text-white">
          Go to Challenges
        </Link>
      </div>
    </main>
  );
}
