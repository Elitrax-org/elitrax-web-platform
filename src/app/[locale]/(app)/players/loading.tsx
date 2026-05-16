import { Skeleton } from "@/components/ui";

export default function PlayersLoading() {
  return (
    <main className="space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-surface-container p-4">
        <Skeleton className="h-16 w-56" />
        <Skeleton className="h-16 w-32" />
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-18 rounded-xl" />
        ))}
      </div>
    </main>
  );
}