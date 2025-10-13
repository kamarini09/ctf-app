export default function RulesPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-gray-800">
      <h1 className="mb-4 text-3xl font-bold text-center">CTF Rules</h1>
      <p className="mb-6 text-sm text-gray-600 text-center">Please read carefully before participating.</p>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Format</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All players must be part of a team (no solo play).</li>
            <li>
              Flags use the format <code className="rounded bg-gray-100 px-1">CTF&#123;ANSWER&#125;</code> and are case-sensitive.
            </li>
            <li>Challenges may include text, a link, or a downloadable file.</li>
            <li>Score = sum of points for challenges your team solves.</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Fair Play</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>No platform attacks, DoS, or scanning non-challenge infrastructure.</li>
            <li>No brute forcing endpoints or automated flag guessing.</li>
            <li>No sharing or trading flags between teams.</li>
            <li>Don’t leak solutions publicly during the event.</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Hints & Support</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Hints may be released at the organizers’ discretion.</li>
            <li>If you find a bug or broken challenge, contact the organizers—not other teams.</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Eligibility & Conduct</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use only legally obtained tools and data.</li>
            <li>Be respectful; harassment or toxicity is not tolerated.</li>
            <li>Organizers’ decisions are final.</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Technical Notes</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Flags are checked server-side; only correct solves are recorded.</li>
            <li>Attachments are private—downloads require signed links.</li>
            <li>Keep your team join code private.</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">By participating you agree to these rules and to play fair. Have fun and good luck!</p>
      </section>
    </main>
  );
}
