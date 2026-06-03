import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import type { Database } from "@/integrations/supabase/types";
import type { Socio } from "@/lib/socios/socios-fields";
import { OnboardingScreen } from "@/components/workspace/OnboardingScreen";
import { FullScreenMessage } from "@/components/layout/FullScreenMessage";
import { SocioPortalScreen } from "@/components/portal/SocioPortalScreen";

type OrgRole = Database["public"]["Enums"]["org_role"];

export interface Membership {
  id: string;
  nombre: string;
  role: OrgRole;
}

interface WorkspaceContextValue {
  cooperatives: Membership[];
  cooperativeId: string;
  cooperative: Membership;
  role: OrgRole;
  canEdit: boolean;
  setCooperativeId: (id: string) => void;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

const STORAGE_KEY = "erp.cooperativeId";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  const membershipsQuery = useQuery({
    queryKey: ["memberships", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("role, cooperative:cooperatives(id, nombre)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.cooperative)
        .map((row) => ({
          id: (row.cooperative as { id: string }).id,
          nombre: (row.cooperative as { nombre: string }).nombre,
          role: row.role,
        }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
  });

  const cooperatives = useMemo(() => membershipsQuery.data ?? [], [membershipsQuery.data]);
  const [selectedId, setSelectedId] = useState<string>("");

  const portalSociosQuery = useQuery({
    queryKey: ["portal-socios", user?.id],
    enabled: !!user && membershipsQuery.isSuccess && cooperatives.length === 0,
    queryFn: async (): Promise<Socio[]> => {
      const { data, error } = await supabase
        .from("socios")
        .select("*")
        .is("deleted_at", null)
        .order("nombre", { ascending: true, nullsFirst: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Keep the selected cooperative valid and persisted.
  useEffect(() => {
    if (cooperatives.length === 0) return;
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const valid =
      (selectedId && cooperatives.some((c) => c.id === selectedId) && selectedId) ||
      (stored && cooperatives.some((c) => c.id === stored) && stored) ||
      cooperatives[0].id;
    if (valid !== selectedId) setSelectedId(valid);
  }, [cooperatives, selectedId]);

  const setCooperativeId = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, id);
  };

  if (!user || membershipsQuery.isLoading) {
    return <FullScreenMessage>Cargando espacio de trabajo...</FullScreenMessage>;
  }

  if (membershipsQuery.isError) {
    return (
      <FullScreenMessage variant="error">
        No se pudieron cargar tus cooperativas.
      </FullScreenMessage>
    );
  }

  if (cooperatives.length === 0) {
    if (portalSociosQuery.isLoading) {
      return <FullScreenMessage>Cargando expediente...</FullScreenMessage>;
    }

    if (portalSociosQuery.isError) {
      return (
        <FullScreenMessage variant="error">
          No se pudo cargar tu expediente.
        </FullScreenMessage>
      );
    }

    const portalSocios = portalSociosQuery.data ?? [];
    if (portalSocios.length > 0) {
      return <SocioPortalScreen socios={portalSocios} onSignOut={signOut} />;
    }

    return <OnboardingScreen onCreated={() => membershipsQuery.refetch()} />;
  }

  const current =
    cooperatives.find((c) => c.id === selectedId) ?? cooperatives[0];

  const value: WorkspaceContextValue = {
    cooperatives,
    cooperativeId: current.id,
    cooperative: current,
    role: current.role,
    canEdit: current.role === "admin" || current.role === "gestor",
    setCooperativeId,
    refetch: () => membershipsQuery.refetch(),
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace debe usarse dentro de <WorkspaceProvider>");
  return ctx;
}
