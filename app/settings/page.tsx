"use client";

import { useEffect, useState } from "react";

function getCookie(name: string) {
  const value = document.cookie.split("; ").find((item) => item.startsWith(name + "="));
  return value ? value.split("=")[1] : "";
}

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setTheme(getCookie("theme") || "light");
    setCompact(getCookie("layout") === "compact");
  }, []);

  function saveTheme(value: string) {
    setTheme(value);
    document.cookie = `theme=${value}; path=/; max-age=31536000`;
    document.body.classList.toggle("dark", value === "dark");
  }

  function saveLayout(value: boolean) {
    setCompact(value);
    document.cookie = `layout=${value ? "compact" : "normal"}; path=/; max-age=31536000`;
    document.body.classList.toggle("compact", value);
  }

  return (
    <div className="page">
      <div className="panel">
        <h1>Settings</h1>
        <p className="small">These settings are saved in cookies so they stay after a refresh.</p>
        <div className="pref-row">
          <div><strong>Theme</strong><div className="small">Choose a light or dark theme.</div></div>
          <select value={theme} onChange={(e) => saveTheme(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="pref-row">
          <div><strong>Compact layout</strong><div className="small">Keeps the interface a little tighter.</div></div>
          <input type="checkbox" checked={compact} onChange={(e) => saveLayout(e.target.checked)} style={{ width: 20 }} />
        </div>
      </div>
    </div>
  );
}
