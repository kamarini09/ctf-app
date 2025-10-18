"use client";

export default function RulesPage() {
  return (
    <main className="px-6 py-10">
      <div className="paper mx-auto max-w-3xl md:p-10">
        {/* Header */}
        <h1 className="font-display text-center text-brand" style={{ fontWeight: 900, letterSpacing: "-0.5px", fontSize: "clamp(32px, 6vw, 64px)" }}>
          KvaliCTF Rules
        </h1>

        <p className="mt-2 text-center text-sm text-[color-mix(in_srgb,var(--ctf-red)50%,white)]">Please read these before you start, if you have a question let me know 😊</p>

        {/* Sections */}
        <section className="mt-8 space-y-10">
          {/* Teams */}
          <div>
            <h2 className="font-display text-xl font-semibold text-brand">Teams</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px] text-gray-800 marker:text-brand">
              <li>You must join or create a team before playing.</li>
              <li>Teams can have 1–3 people. Choose your teammates wisely!</li>
              <li>Don’t share your answers with other teams (that’s no fun for anyone 😉).</li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="h-px border-0 bg-[color-mix(in_srgb,var(--ctf-red)20%,white)]" />

          {/* Flag Format */}
          <div>
            <h2 className="font-display text-xl font-semibold text-brand">Flag Format</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px] text-gray-800 marker:text-brand">
              <li>
                All flags follow this format: <code className="text-brand">KCTF&#123;your_flag_here&#125;</code>
              </li>
              <li>
                Examples: <code className="text-brand">KCTF&#123;FLAG&#125;</code>, <code className="text-brand">KCTF&#123;my_name_is_2345&#125;</code>
              </li>
              <li>Flags are case-sensitive so copy them exactly as found!</li>
            </ul>
          </div>

          {/* Divider */}
          <hr className="h-px border-0 bg-[color-mix(in_srgb,var(--ctf-red)20%,white)]" />

          {/* Developers’ Note */}
          <div>
            <h2 className="font-display text-xl font-semibold text-brand">Developers’ Note</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-[15px] text-gray-800 marker:text-brand">
              <li>If you’re a developer... please don’t judge the code too harshly 🌻 It was built for speed and fun! I’m sure it wouldn’t pass the PRs 🙈</li>
            </ul>
          </div>

          <p className="text-center text-sm text-[color-mix(in_srgb,var(--ctf-red)50%,white)]">That’s it! Be curious, be kind, and have fun capturing those flags 🏴‍☠️</p>
        </section>
      </div>
    </main>
  );
}
