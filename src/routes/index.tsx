import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sprout,
  Users,
  FileText,
  Landmark,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ERP para cooperativas agrícolas · Socios, expedientes y ayudas" },
      {
        name: "description",
        content:
          "Gestiona socios, expedientes y ayudas de tu cooperativa agrícola en una sola plataforma rápida y clara.",
      },
      { property: "og:title", content: "ERP para cooperativas agrícolas" },
      {
        property: "og:description",
        content:
          "Gestiona socios, expedientes y ayudas de tu cooperativa agrícola en una sola plataforma.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Socios al detalle",
    desc: "Tabla, tarjetas y tablero con filtros, orden y columnas que se recuerdan por usuario.",
  },
  {
    icon: FileText,
    title: "Expedientes ordenados",
    desc: "Toda la documentación de cada socio centralizada y siempre a mano.",
  },
  {
    icon: Landmark,
    title: "Ayudas bajo control",
    desc: "Sigue solicitudes y subvenciones sin perder ningún plazo.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Cooperativa ERP</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Acceder</Link>
        </Button>
      </header>

      {/* Hero */}
      <main className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-3xl rounded-full bg-accent/40 blur-3xl"
        />
        <section className="relative mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Hecho para cooperativas agrícolas
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Tu cooperativa,{" "}
            <span className="text-primary">bien gestionada</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Socios, expedientes y ayudas en una sola plataforma rápida y clara.
            Menos hojas de cálculo, más control.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/auth">
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">
                <LayoutGrid className="h-4 w-4" />
                Ver el panel
              </Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Cooperativa ERP</span>
          <Link to="/auth" className="hover:text-foreground">
            Acceder a tu cuenta
          </Link>
        </div>
      </footer>
    </div>
  );
}
