"use client";

export default function RulesPage() {
  return (
    <main className="px-6 py-10">
      {/* Paper background */}
      <div
        className="
          relative mx-auto max-w-3xl  border border-[#efe7df] bg-[#fffdf8] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]
          md:p-10
        "
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 0.6px, transparent 0.6px)",
          backgroundSize: "10px 10px",
        }}
      >
        {/* Header */}
        <h1
          className="font-display text-center text-[var(--ctf-red)]"
          style={{
            fontWeight: 900,
            letterSpacing: "-0.5px",
            fontSize: "clamp(32px, 6vw, 64px)",
          }}
        >
          KvaliCTF Rules
        </h1>

        <p className="mt-2 text-center text-sm text-[#e08a8a]">Please read these before you start, if you have a question let me know 😊</p>

        {/* Sections (no numbers, no boxes) */}
        <section className="mt-8 space-y-10">
          {/* Teams */}
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ctf-red)]">Teams</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1 text-[15px] text-gray-800 marker:text-[var(--ctf-red)]">
              <li>You must join or create a team before playing.</li>
              <li>Teams can have 1–3 people.Choose your teammates wisely!</li>
              <li>Don’t share your answers with other teams (that’s no fun for anyone 😉).</li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="border-0 h-px bg-gradient-to-r from-transparent via-[#ffd6d6] to-transparent" />

          {/* Flag Format */}
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ctf-red)]">Flag Format</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1 text-[15px] text-gray-800 marker:text-[var(--ctf-red)]">
              <li>
                All flags follow this format: <code className="rounded bg-[#fff0f0] px-1 py-0.5 text-sm text-[var(--ctf-red)]">KCTF&#123;your_flag_here&#125;</code>
              </li>
              <li>
                Examples: <code className="rounded bg-[#fff0f0] px-1 py-0.5 text-sm text-[var(--ctf-red)]">KCTF&#123;FLAG&#125;</code>, <code className="rounded bg-[#fff0f0] px-1 py-0.5 text-sm text-[var(--ctf-red)]">KCTF&#123;my_name_is_2345&#125;</code>
              </li>
              <li>Flags are case-sensitive so copy them exactly as found!</li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="border-0 h-px bg-gradient-to-r from-transparent via-[#ffd6d6] to-transparent" />

          {/* Developers’ Note */}
          <div>
            <h2 className="font-display text-xl font-semibold text-[var(--ctf-red)]">Developers’ Note</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1 text-[15px] text-gray-800 marker:text-[var(--ctf-red)]">
              <li>If you’re a developer... please don’t judge the code too harshly 🌻 It was built for speed and fun! I’m sure it wouldn’t pass the PRs 🙈</li>
            </ul>
          </div>

          <p className="text-center text-sm text-[#e08a8a]">That’s it! Be curious, be kind, and have fun capturing those flags 🏴‍☠️</p>
        </section>
      </div>
    </main>
  );
}
