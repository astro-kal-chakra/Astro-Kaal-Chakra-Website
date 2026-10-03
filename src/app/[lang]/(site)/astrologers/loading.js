import { AstrologerCardSkeleton } from "@/features/astrologers/components/AstrologerCard";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-8">
      <Skeleton className="mb-6 h-9 w-64" />
      <Skeleton className="mb-3 h-11 w-full rounded-xl" />
      <Skeleton className="mb-6 h-9 w-full rounded-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AstrologerCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
