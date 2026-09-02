import { OrbitMark } from "./OrbitMark";
import { footerLinks } from "../data/mockData";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <OrbitMark className="h-6 w-6 text-brand-secondary opacity-90" />
          <div>
            <span className="block text-sm font-semibold tracking-tight text-text-primary">OrbitKeep</span>
            <span className="block text-xs text-text-secondary">Understanding orbit. Protecting tomorrow.</span>
          </div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-white/[0.06] pt-6">
        <p className="text-xs text-text-secondary/70">
          © {new Date().getFullYear()} OrbitKeep. Orbital data shown is illustrative.
        </p>
      </div>
    </footer>
  );
}
