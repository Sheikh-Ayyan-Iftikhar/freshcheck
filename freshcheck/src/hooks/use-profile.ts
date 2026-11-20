"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "freshcheck.profile.name";
const EVENT = "freshcheck:profile";

/** Browser-local display name only. There is no authentication or server-side profile. */
export function useProfile() {
  const [name, setNameState] = useState("");

  useEffect(() => {
    const read = () => {
      try { setNameState(window.localStorage.getItem(KEY) ?? ""); } catch { /* ignore */ }
    };
    read();
    window.addEventListener(EVENT, read);
    return () => window.removeEventListener(EVENT, read);
  }, []);

  const setName = useCallback((value: string) => {
    try { window.localStorage.setItem(KEY, value); } catch { /* ignore */ }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { name, setName };
}
