"use client";

import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="container-page flex flex-1 items-center justify-center py-20">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<ButtonLink href="/">Go to home</ButtonLink>}
      />
    </main>
  );
}
