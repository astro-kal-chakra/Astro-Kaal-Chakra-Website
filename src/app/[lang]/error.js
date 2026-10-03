"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function Error({ error, reset }) {

  useEffect(() => {
    // Hook up Sentry or similar here.
    console.error(error);
  }, [error]);

  return (
    <main className="container-page flex flex-1 items-center justify-center py-20">
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong"
        description="Please try again. If the problem continues, contact support."
        action={
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/" variant="outline">
              Go to home
            </ButtonLink>
          </div>
        }
      />
    </main>
  );
}
