
import Navbar from "@/components/Navbar";
import ContractUpload from "@/components/ContractUpload";

const steps = [
  {
    number: "01",
    title: "Upload your contract",
    description:
      "Bring your agreement in PDF or document format and let Ghost Contracts examine its contents.",
  },
  {
    number: "02",
    title: "Understand the risks",
    description:
      "Identify potentially risky clauses, unclear obligations, and terms that deserve closer attention.",
  },
  {
    number: "03",
    title: "Make informed decisions",
    description:
      "Review clear explanations and understand what to discuss with a qualified legal professional.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section
        id="get-started"
        className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs tracking-wide text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
            LEGAL CLARITY, REIMAGINED
          </div>

          <h1 className="font-serif text-5xl leading-[1.12] tracking-tight md:text-7xl">
            Contracts are complex.
            <br />
            <span className="italic text-[var(--primary)]">
              Understanding them shouldn't be.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
            Ghost Contracts helps you uncover potentially risky clauses,
            understand your obligations, and approach every agreement
            with greater clarity.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="#get-started"
              className="rounded-lg bg-[var(--primary)] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Analyze a contract <span aria-hidden="true">→</span>
            </a>

            <a
              href="#about"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-7 py-4 text-sm font-semibold transition hover:border-[var(--primary)]"
            >
              Explore the platform
            </a>
          </div>

          <p className="mt-5 text-xs text-[var(--muted)]">
            AI-assisted analysis · Transparent explanations · Privacy-conscious design
          </p>
        </div>

        <ContractUpload />
      </section>

      <section
        id="how-it-works"
        className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--primary)]">
              A SIMPLER APPROACH
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              Clarity at every step.
            </h2>

            <p className="mt-5 leading-7 text-[var(--muted)]">
              From the first page to the final clause, understand what
              deserves your attention before you sign.
            </p>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="border-t border-[var(--border)] pt-6"
              >
                <p className="font-serif text-3xl text-[var(--primary)]">
                  {step.number}
                </p>

                <h3 className="mt-5 font-serif text-2xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer
        id="about"
        className="border-t border-[var(--border)] px-6 py-8 md:px-12"
      >
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-sm text-[var(--muted)] md:flex-row">
          <p>
            <span className="font-serif font-bold text-[var(--foreground)]">
              ghost.
            </span>{" "}
            Legal clarity, reimagined.
          </p>

          <p>
            AI-assisted contract review. Not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}