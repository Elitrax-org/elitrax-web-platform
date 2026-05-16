import { Skeleton } from "@/components/ui";

export default function SessionsLoading() {
  return (
    <main className="space-y-4 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-outline-variant bg-surface-container p-4">
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-16 w-56" />
        <Skeleton className="h-16 min-w-[220px] flex-1" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </main>
  );
}