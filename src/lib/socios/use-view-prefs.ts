import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import { supabase } from "@/integrations/supabase/client";

export type SociosView = "table" | "cards" | "board";

export interface SociosViewPrefs {
  view: SociosView;
  search: string;
  globalFilter: string;
  showFilters: boolean;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
}

export const DEFAULT_PREFS: SociosViewPrefs = {
  view: "table",
  search: "",
  globalFilter: "",
  showFilters: false,
  sorting: [],
  columnFilters: [],
  columnVisibility: {},
};

const PREFERENCE_KEY = "socios_view";

function mergePrefs(value: unknown): SociosViewPrefs {
  if (!value || typeof value !== "object") return DEFAULT_PREFS;
  return { ...DEFAULT_PREFS, ...(value as Partial<SociosViewPrefs>) };
}

export function useSociosViewPrefs(userId: string) {
  const [prefs, setPrefs] = useState<SociosViewPrefs>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load once per user
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      const { data } = await supabase
        .from("user_preferences")
        .select("value")
        .eq("user_id", userId)
        .eq("preference_key", PREFERENCE_KEY)
        .maybeSingle();
      if (cancelled) return;
      if (data?.value) setPrefs(mergePrefs(data.value));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Debounced save whenever prefs change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void supabase.from("user_preferences").upsert(
        {
          user_id: userId,
          preference_key: PREFERENCE_KEY,
          value: prefs as unknown as Record<string, unknown>,
        },
        { onConflict: "user_id,preference_key" },
      );
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [prefs, loaded, userId]);

  const makeSetter = useCallback(
    <K extends keyof SociosViewPrefs>(
      key: K,
    ): Dispatch<SetStateAction<SociosViewPrefs[K]>> =>
      (updater) =>
        setPrefs((prev) => ({
          ...prev,
          [key]:
            typeof updater === "function"
              ? (updater as (old: SociosViewPrefs[K]) => SociosViewPrefs[K])(
                  prev[key],
                )
              : updater,
        })),
    [],
  );

  return { prefs, loaded, makeSetter };
}