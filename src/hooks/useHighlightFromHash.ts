import { useEffect, useState } from "react";

function readFeedHash(): string | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash.replace(/^#/, "");
  return h.startsWith("feed-") ? h : null;
}

/**
 * Deep-link highlight: when the URL ends in `#feed-<id>` (copied from a
 * card's share button), returns that anchor id so the grid can emphasize
 * the card. Clears itself a few seconds after it becomes visible.
 *
 * Pass `paused: true` while the list is still loading so a slow backend
 * can't eat the highlight before the target card even mounts.
 */
export function useHighlightFromHash(options?: { paused?: boolean }): string | null {
  const paused = options?.paused ?? false;
  const [highlight, setHighlight] = useState<string | null>(() => readFeedHash());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const arm = () => {
      if (timer) clearTimeout(timer);
      if (paused) return;
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
  }, [paused]);

  return highlight;
}
