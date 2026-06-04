import { LogOut, ChevronsUpDown, Check } from "lucide-react";

import { useAuth } from "@/lib/auth/auth-context";
import { useWorkspace } from "@/lib/workspace/workspace-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  consulta: "Consulta",
};

export function Topbar() {
  const { user, signOut } = useAuth();
  const { cooperatives, cooperative, cooperativeId, setCooperativeId, role } =
    useWorkspace();

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card px-3">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <span className="max-w-[200px] truncate font-medium">
                {cooperative.nombre}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Cooperativas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {cooperatives.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => setCooperativeId(c.id)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{c.nombre}</span>
                {c.id === cooperativeId && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {ROLE_LABEL[role] ?? role}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <NotificationBell />
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {(user?.email ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-[160px] truncate text-sm sm:inline">
              {user?.email}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}