import { useEffect, useState } from "react";

function readFeedHash(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("feed-") ? h : null;
}

/**
 * Deep-link highlight: when the URL ends in `#feed-<id>` (copied from a
 * card's share button), returns that anchor id so the grid can emphasize
 * the card. Clears itself after a few seconds.
 */
export function useHighlightFromHash(): string | null {
  const [highlight, setHighlight] = useState<string | null>(() => readFeedHash());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setHighlight(null), 4000);
    };
    const onChange = () => {
      setHighlight(readFeedHash());
      arm();
    };
    window.addEventListener("hashchange", onChange);
    if (readFeedHash()) arm();
    return () => {
      window.removeEventListener("hashchange", onChange);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return highlight;
}
