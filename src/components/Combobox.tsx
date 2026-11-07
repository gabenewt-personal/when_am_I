"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Category, CategoryOption } from "@/lib/content/types";
import { exactOption, suggest } from "@/lib/search";

/**
 * Accessible autocomplete (WAI-ARIA 1.2 combobox + listbox).
 * - The full category list shows on focus; typing filters it.
 * - ↑/↓ move, Enter SELECTS the highlighted option (never submits), Esc closes.
 * - Only a selected option counts. Free text is never accepted as a guess.
 */
export function Combobox({
  category,
  triedIds,
  selected,
  onSelect,
}: {
  category: Category;
  triedIds: ReadonlySet<string>;
  selected: CategoryOption | null;
  onSelect: (option: CategoryOption | null) => void;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const results = useMemo(() => suggest(category, selected && text === selected.label ? "" : text), [category, text, selected]);
  const enabledIdx = results.map((r, i) => (triedIds.has(r.option.id) ? -1 : i)).filter((i) => i >= 0);

  const openMenu = (highlight?: number) => {
    setOpen(true);
    if (highlight !== undefined) setActive(highlight);
  };

  const choose = (option: CategoryOption) => {
    if (triedIds.has(option.id)) return;
    onSelect(option);
    setText(option.label);
    setOpen(false);
    setActive(-1);
  };

  const move = (dir: 1 | -1) => {
    if (!enabledIdx.length) return;
    const pos = enabledIdx.indexOf(active);
    const next = pos === -1 ? (dir === 1 ? 0 : enabledIdx.length - 1) : (pos + dir + enabledIdx.length) % enabledIdx.length;
    setActive(enabledIdx[next]);
    document.getElementById(`${id}-opt-${enabledIdx[next]}`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        move(-1);
        break;
      case "Enter": {
        e.preventDefault(); // never submit from the text box
        const r = open && active >= 0 ? results[active] : undefined;
        if (r) choose(r.option);
        else if (enabledIdx.length === 1) choose(results[enabledIdx[0]].option);
        else openMenu();
        break;
      }
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="combo">
      <label className="label" htmlFor={`${id}-input`}>
        When am I?
      </label>
      <input
        ref={inputRef}
        id={`${id}-input`}
        className="combo__input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-describedby={`${id}-help`}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder={`Search ${category.label.toLowerCase()}…`}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          if (selected && v !== selected.label) onSelect(null);
          // Highlight an exact label/alias match, but still require an explicit pick.
          const exact = exactOption(category, v);
          const list = suggest(category, v);
          const idx = exact ? list.findIndex((r) => r.option.id === exact.id && !triedIds.has(exact.id)) : -1;
          setOpen(true);
          setActive(idx >= 0 ? idx : -1);
        }}
        onFocus={() => {
          openMenu();
          // keep the field (and Submit beside it) above the on-screen keyboard
          setTimeout(() => inputRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }), 250);
        }}
        onClick={() => openMenu()}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <p id={`${id}-help`} className="sr-only">
        Choose one answer from the list. Use the arrow keys to browse and Enter to select.
      </p>
      <ul id={listId} role="listbox" aria-label={`${category.label} answers`} className="combo__list" hidden={!open}>
        {results.length === 0 && (
          <li className="combo__empty" role="presentation">
            Not in this category. Try another term.
          </li>
        )}
        {results.map((r, i) => {
          const tried = triedIds.has(r.option.id);
          return (
            <li
              key={r.option.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              aria-disabled={tried || undefined}
              className={`combo__opt${i === active ? " is-active" : ""}${tried ? " is-tried" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r.option)}
              onMouseEnter={() => !tried && setActive(i)}
            >
              <span>{r.option.label}</span>
              {r.matchedAlias && <span className="combo__alias">“{r.matchedAlias}”</span>}
              {tried && <span className="combo__tag">tried</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
