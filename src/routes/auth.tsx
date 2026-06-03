import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder · ERP Cooperativas" },
      {
        name: "description",
        content:
          "Acceso al ERP administrativo para cooperativas agrícolas: gestión de socios, expedientes y ayudas.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, loading, navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo iniciar sesión", { description: error.message });
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  };

  const handleSignUp = async (email: string, password: string, nombre: string) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { nombre },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo crear la cuenta", { description: error.message });
      return;
    }
    toast.success("Cuenta creada", {
      description: "Revisa tu correo si se requiere confirmación, o accede directamente.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">ERP Cooperativas</h1>
            <p className="text-sm text-muted-foreground">
              Gestión administrativa de socios agrícolas
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <CredentialsForm
                cta="Entrar"
                submitting={submitting}
                onSubmit={(e, p) => handleSignIn(e, p)}
              />
            </TabsContent>

            <TabsContent value="signup">
              <CredentialsForm
                cta="Crear cuenta"
                withName
                submitting={submitting}
                onSubmit={(e, p, n) => handleSignUp(e, p, n ?? "")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function CredentialsForm({
  cta,
  withName,
  submitting,
  onSubmit,
}: {
  cta: string;
  withName?: boolean;
  submitting: boolean;
  onSubmit: (email: string, password: string, nombre?: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email.trim(), password, nombre.trim());
      }}
    >
      {withName && (
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            autoComplete="name"
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@cooperativa.es"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={withName ? "new-password" : "current-password"}
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Procesando…" : cta}
      </Button>
    </form>
  );
}