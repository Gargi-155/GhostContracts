
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 md:px-12">
      <Link
        href="/"
        className="font-serif text-2xl font-bold tracking-tight"
      >
        ghost<span className="text-[var(--primary)]">.</span>
      </Link>

      <div className="hidden items-center gap-8 text-sm text-[var(--muted)] md:flex">
        <Link
          href="/#how-it-works"
          className="transition hover:text-[var(--primary)]"
        >
          How it works
        </Link>

        <Link
          href="/#about"
          className="transition hover:text-[var(--primary)]"
        >
          About
        </Link>
      </div>

      <Link
        href="/#get-started"
        className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)]"
      >
        Get started
      </Link>
    </nav>
  );
}