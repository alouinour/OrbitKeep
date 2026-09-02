import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, X } from "lucide-react";
import { OrbitMark } from "./OrbitMark";
import { navLinks } from "../data/mockData";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6"
    >
      <div className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
        {/* Logo / wordmark */}
        <a href="/" className="flex items-center gap-2.5" aria-label="OrbitKeep home">
          <OrbitMark className="h-7 w-7 shrink-0 text-brand-secondary" />
          <span className="text-[15px] font-semibold tracking-tight text-text-primary">
            Orbit<span className="text-brand-secondary">Keep</span>
          </span>
        </a>

        {/* Desktop nav links */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium tracking-tight transition-colors ${
                    currentPath === link.href
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.active && (
                    <span className="absolute inset-0 rounded-lg bg-brand-secondary/15 ring-1 ring-brand-secondary/30" />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:flex"
          >
            <Search className="h-[17px] w-[17px]" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:flex"
          >
            <Bell className="h-[17px] w-[17px]" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-warning" />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-secondary to-brand-primary text-xs font-semibold text-text-primary ring-1 ring-white/10 sm:flex"
          >
            OK
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary md:hidden"
          >
            {mobileOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-label="Mobile"
          className="glass-panel mx-auto mt-2 max-w-6xl rounded-2xl p-2 md:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-3.5 py-2.5 text-sm font-medium ${
                    currentPath === link.href
                      ? "bg-brand-secondary/15 text-text-primary ring-1 ring-brand-secondary/30"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </motion.nav>
      )}
    </motion.header>
  );
}
