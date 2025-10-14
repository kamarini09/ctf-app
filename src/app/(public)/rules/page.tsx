"use client";

export default function RulesPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-gray-800">
      <h1 className="mb-4 text-3xl font-bold text-center">KvaliCTF Rules</h1>
      <p className="mb-6 text-sm text-gray-600 text-center">Please read these before you start, if you have a question let me know 😊</p>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Teams</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must join or create a team before playing.</li>
            <li>Teams can have 1–3 people.Choose your teammates wisely!</li>
            <li>Don’t share your answers with other teams (that’s no fun for anyone 😉).</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Flag Format</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              All flags follow this format: <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">KCTF&#123;your_flag_here&#125;</code>
            </li>
            <li>
              Examples: <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">KCTF&#123;FLAG&#125;</code>, <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">KCTF&#123;my_name_is_2345&#125;</code>
            </li>
            <li>Flags are case-sensitive so copy them exactly as found!</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Developers’ Note</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li> If you’re a developer... please don’t judge the code too harshly 🌻 It was built for speed and fun! I’m sure it wouldn’t pass the PRs 🙈</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 text-center">That’s it! Be curious, be kind, and have fun capturing those flags 🏴‍☠️</p>
      </section>
    </main>
  );
}
