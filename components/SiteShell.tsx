"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const theme = document.cookie.split("; ").find((item) => item.startsWith("theme="))?.split("=")[1];
    if (theme === "dark") {
      setDark(true);
      document.body.classList.add("dark");
    }

    const layout = document.cookie.split("; ").find((item) => item.startsWith("layout="))?.split("=")[1];
    if (layout === "compact") {
      setCompact(true);
      document.body.classList.add("compact");
    }
  }, []);

  function toggleTheme() {
    const newValue = !dark;
    setDark(newValue);
    document.cookie = `theme=${newValue ? "dark" : "light"}; path=/; max-age=31536000`;
    document.body.classList.toggle("dark", newValue);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">ASSESSMENT 1 - FRONTEND DESIGN AND USABILITY</div>
        <div className="header-inner">
          <Link href="/" className="brand">PHONEME'LE</Link>

          <nav className="nav" aria-label="Main navigation">
            <Link href="/">HOME</Link>
            <span>|</span>
            <Link href="/wordle">WORDLE</Link>
            <span>|</span>
            <Link href="/word-search">WORD SEARCH</Link>
            <span>|</span>
            <Link href="/about">ABOUT</Link>
            <span>|</span>
            <Link href="/settings">SETTING</Link>
          </nav>

          <div className="menu-wrap">
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
              <span></span><span></span><span></span>
            </button>
            {menuOpen && (
              <div className="menu">
                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link href="/wordle" onClick={() => setMenuOpen(false)}>Wordle</Link>
                <Link href="/word-search" onClick={() => setMenuOpen(false)}>Word Search</Link>
                <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
                <Link href="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
                <button className="secondary menu-theme" onClick={toggleTheme}>
                  {dark ? "Light mode" : "Dark mode"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={compact ? "compact-layout" : ""}>{children}</main>

      <footer className="footer">
        <div className="footer-inner">Zac Whyte | Student Number: 22308075</div>
      </footer>
    </div>
  );
}
