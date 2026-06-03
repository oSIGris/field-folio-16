import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function FullScreenMessage({
  children,
  variant = "loading",
}: {
  children: ReactNode;
  variant?: "loading" | "error";
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div
        className={cn(
          "flex items-center gap-3 text-sm",
          variant === "error" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {variant === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{children}</span>
      </div>
    </div>
  );
}