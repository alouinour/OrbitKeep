import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, X, ChevronRight, Check, ShieldAlert } from "lucide-react";
import { OrbitMark } from "./OrbitMark";
import { navLinks, toolCards } from "../data/mockData";
import { useNavbarAlerts } from "../hooks/useNavbarAlerts";
import { riskClass, riskLabels } from "../data/riskMonitorData";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<"search" | "notifications" | "account" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const currentPath = window.location.pathname;

  const { alerts, unreadCount, loading: alertsLoading, markRead, markAllRead } = useNavbarAlerts();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const searchResults = [
    ...navLinks.map((link) => ({ label: link.label, href: link.href, type: "Navigation" })),
    ...toolCards.map((card) => ({ label: card.title, href: card.href, type: card.eyebrow })),
  ].filter((result) => result.label.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  function togglePanel(panel: "search" | "notifications" | "account") {
    setOpenPanel((current) => (current === panel ? null : panel));
    setMobileOpen(false);
  }

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6 sm:px-6"
    >
      <div ref={panelRef} className="relative mx-auto max-w-6xl">
        <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
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
                  aria-current={currentPath === link.href ? "page" : undefined} // FIX: était link.active (toujours "Dashboard")
                  className={`relative rounded-lg px-3.5 py-2 text-[13px] font-medium tracking-tight transition-colors ${
                    currentPath === link.href
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {currentPath === link.href && ( // FIX: le surlignage suivait link.active au lieu de la page courante
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
            aria-expanded={openPanel === "search"}
            onClick={() => togglePanel("search")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:flex"
          >
            <Search className="h-[17px] w-[17px]" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={openPanel === "notifications"}
            onClick={() => togglePanel("notifications")}
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary sm:flex"
          >
            <Bell className="h-[17px] w-[17px]" />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-warning" />
            )}
          </button>
          <button
            type="button"
            aria-label="Account"
            aria-expanded={openPanel === "account"}
            onClick={() => togglePanel("account")}
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

        {openPanel === "search" && (
          <div className="glass-panel absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl p-3 shadow-2xl sm:w-80">
            <label htmlFor="site-search" className="sr-only">Search OrbitKeep</label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <Search className="h-4 w-4 shrink-0 text-text-secondary" />
              <input
                id="site-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search OrbitKeep"
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-secondary"
              />
            </div>
            <div className="mt-2 max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? searchResults.map((result) => (
                <a
                  key={`${result.type}-${result.href}`}
                  href={result.href}
                  onClick={() => setOpenPanel(null)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                >
                  <span>
                    <span className="block text-text-primary">{result.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">{result.type}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </a>
              )) : <p className="px-3 py-3 text-sm text-text-secondary">No matching results.</p>}
            </div>
          </div>
        )}

        {openPanel === "notifications" && (
          <div className="glass-panel absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl shadow-2xl sm:w-80">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning ring-1 ring-warning/30">
                    {unreadCount} unread
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="text-[11px] text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="max-h-72 overflow-y-auto">
              {alertsLoading ? (
                <p className="px-4 py-6 text-center text-xs text-text-secondary">Loading…</p>
              ) : alerts.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-text-secondary">No active alerts right now.</p>
              ) : (
                alerts.map((alert) => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => void markRead(alert.id)}
                    disabled={alert.is_read}
                    className={`flex w-full items-start gap-3 border-b border-white/[0.04] px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5 disabled:cursor-default ${alert.is_read ? "opacity-50" : ""}`}
                  >
                    {/* Icône colorée selon le niveau */}
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg navbar-notif-icon-${alert.risk_level.toLowerCase()}`}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-text-primary">
                        {alert.satellite_name}
                        <span className="mx-1 text-text-secondary">×</span>
                        {alert.debris_name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-text-secondary">
                        {alert.distance_km.toFixed(2)} km ·{" "}
                        <span className={`font-semibold navbar-notif-text-${alert.risk_level.toLowerCase()}`}>
                          {riskLabels[alert.risk_level]}
                        </span>
                      </p>
                    </div>
                    {!alert.is_read && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-2.5">
              <a
                href="/risk-monitor"
                onClick={() => setOpenPanel(null)}
                className="flex items-center justify-between text-[12px] text-text-secondary transition-colors hover:text-text-primary"
              >
                <span>View all in Risk Monitor</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {openPanel === "account" && (
          <div className="glass-panel absolute right-0 top-full mt-2 w-56 rounded-xl p-2 shadow-2xl">
            <div className="border-b border-white/10 px-3 py-2">
              <p className="text-sm font-semibold text-text-primary">OrbitKeep user</p>
              <p className="text-xs text-text-secondary">Mission control account</p>
            </div>
            <a href="#profile" onClick={() => setOpenPanel(null)} className="mt-1 block rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">Profile settings</a>
            <button type="button" onClick={() => setOpenPanel(null)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
              <span>All systems nominal</span>
              <Check className="h-4 w-4 text-success" />
            </button>
          </div>
        )}
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