import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminPageSkeleton({
  statCount = 4,
  listCount = 4,
  showFilters = true,
}) {
  return (
    <div className="surface-page min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-[85vw]" />
          </div>
          <Skeleton className="h-10 w-28" />
        </section>

        {showFilters ? (
          <Card className="surface-card shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        ) : null}

        {statCount > 0 ? (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: statCount }).map((_, index) => (
              <Card key={index} className="surface-card shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </section>
        ) : null}

        <section className="space-y-3">
          {Array.from({ length: listCount }).map((_, index) => (
            <Card key={index} className="surface-card shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-7/12" />
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}

export function AdminDialogSkeleton() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-5 w-2/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-10/12" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
