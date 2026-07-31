"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { BrandMark } from "@/components/BrandMark";
import type { EquityMode } from "@/lib/equity/types";

import { ModeSwitch } from "./ModeSwitch";

interface StudioHeaderProps {
  mode: EquityMode;
  onModeChange: (mode: EquityMode) => void;
}

export function StudioHeader({
  mode,
  onModeChange,
}: StudioHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="studio-header">
      <BrandMark />
      <div className="studio-header-actions">
        <ModeSwitch value={mode} onChange={onModeChange} />
        <button
          type="button"
          className="theme-toggle"
          aria-label="Toggle color theme"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          <Sun className="theme-icon theme-icon-light" aria-hidden="true" />
          <Moon className="theme-icon theme-icon-dark" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
