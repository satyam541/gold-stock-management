"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Plus, User } from "lucide-react";
import { Person } from "@/types";

interface PersonComboboxProps {
  value: string;           // personId or "" 
  personName: string;      // display name
  onChange: (personId: string, personName: string) => void;
  placeholder?: string;
}

export default function PersonCombobox({
  value,
  personName,
  onChange,
  placeholder = "Type a name...",
}: PersonComboboxProps) {
  const [query, setQuery] = useState(personName || "");
  const [results, setResults] = useState<Person[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search persons as user types
  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`/api/persons?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 200);
    return () => clearTimeout(t);
  }, [query, search]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Sync display name if parent clears the value
  useEffect(() => {
    if (!value && !personName) setQuery("");
  }, [value, personName]);

  const selectPerson = (p: Person) => {
    onChange(p.id, p.name);
    setQuery(p.name);
    setOpen(false);
    setResults([]);
  };

  const createPerson = async () => {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const newPerson = await res.json();
      onChange(newPerson.id, newPerson.name);
      setQuery(newPerson.name);
      setOpen(false);
      setResults([]);
    } finally {
      setCreating(false);
    }
  };

  const exactMatch = results.some(
    (p) => p.name.toLowerCase() === query.trim().toLowerCase()
  );

  const showCreateOption = query.trim().length > 0 && !exactMatch && !creating;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <User
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "14px",
            height: "14px",
            color: "hsl(var(--muted-foreground))",
            pointerEvents: "none",
          }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Clear selection if user edits after picking
            if (value) onChange("", e.target.value);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (results.length === 1) {
                selectPerson(results[0]);
              } else if (showCreateOption) {
                createPerson();
              }
            }
            if (e.key === "Escape") setOpen(false);
          }}
          style={{
            width: "100%",
            height: "36px",
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--muted) / 0.3)",
            padding: "0 12px 0 32px",
            fontSize: "14px",
            color: "hsl(var(--foreground))",
            outline: "none",
          }}
          className="focus:ring-2 focus:ring-primary/30"
        />
        {value && (
          <span
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontSize: "10px",
              fontWeight: 600,
              padding: "1px 6px",
              borderRadius: "99px",
            }}
          >
            ✓
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (results.length > 0 || showCreateOption) && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPerson(p)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                borderBottom: "1px solid hsl(var(--border) / 0.5)",
              }}
              className="hover:bg-muted/50 transition-colors"
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "hsl(var(--foreground))", margin: 0 }}>
                  {p.name}
                </p>
                {p.phone && (
                  <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: 0 }}>
                    {p.phone}
                  </p>
                )}
              </div>
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onClick={createPerson}
              disabled={creating}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
              className="hover:bg-primary/5 transition-colors"
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1.5px dashed hsl(var(--primary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Plus style={{ width: "14px", height: "14px", color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "hsl(var(--primary))", margin: 0 }}>
                  {creating ? "Creating..." : `Add "${query.trim()}"`}
                </p>
                <p style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", margin: 0 }}>
                  Create new person
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
