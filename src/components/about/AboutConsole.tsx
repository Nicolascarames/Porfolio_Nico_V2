import { useRef, useState, type KeyboardEvent } from "react";
import { AboutChat } from "./AboutChat";
import { AboutTerminal } from "./AboutTerminal";
import "./about.css";

/** Consola de Sobre mí con dos pestañas. Ambos paneles siguen montados para conservar su estado. */

const TABS = [
  { id: "terminal", label: "Terminal" },
  { id: "chat", label: "Chat" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AboutConsole() {
  const [tab, setTab] = useState<TabId>("terminal");
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[n].id);
    btnRefs.current[TABS[n].id]?.focus({ preventScroll: true });
  };

  return (
    <div>
      <div className="ac-tabs">
        <div
          className="r4-seg r4-glass"
          role="tablist"
          aria-label="Consola"
          onKeyDown={onKeyDown}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                btnRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`ac-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`ac-panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div
        role="tabpanel"
        id="ac-panel-terminal"
        aria-labelledby="ac-tab-terminal"
        hidden={tab !== "terminal"}
      >
        <AboutTerminal />
      </div>
      <div
        role="tabpanel"
        id="ac-panel-chat"
        aria-labelledby="ac-tab-chat"
        hidden={tab !== "chat"}
      >
        <AboutChat />
      </div>
    </div>
  );
}
