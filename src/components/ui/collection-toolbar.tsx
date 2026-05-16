import { ListFilter, Plus, Search, X } from "lucide-react";

import { Link } from "@/i18n/routing";

import { buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/ui/cn";

type CollectionFilterOption = {
  value: string;
  label: string;
};

type CollectionToolbarFilter = {
  name: string;
  label: string;
  value?: string;
  options: readonly CollectionFilterOption[];
};

type CollectionToolbarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  searchValue?: string;
  filters?: readonly CollectionToolbarFilter[];
  submitLabel: string;
  clearLabel: string;
  clearHref: string;
  createHref: string;
  createLabel: string;
  className?: string;
};

const EMPTY_FILTERS: readonly CollectionToolbarFilter[] = [];

export function CollectionToolbar({
  searchLabel,
  searchPlaceholder,
  searchValue,
  filters = EMPTY_FILTERS,
  submitLabel,
  clearLabel,
  clearHref,
  createHref,
  createLabel,
  className,
}: CollectionToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container/70 p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <form method="get" className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(auto-fit,minmax(11rem,1fr))]">
            <Field label={searchLabel} className="min-w-0">
              <div className="flex h-10 items-center gap-2 rounded-md border border-outline-variant bg-surface px-3">
                <Search aria-hidden="true" className="size-4 text-outline" />
                <Input
                  name="q"
                  defaultValue={searchValue}
                  placeholder={searchPlaceholder}
                  className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 focus-visible:outline-0"
                />
              </div>
            </Field>
            {filters.map((filter) => (
              <Field key={filter.name} label={filter.label}>
                <div className="relative">
                  <ListFilter aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-outline" />
                  <Select
                    name={filter.name}
                    defaultValue={filter.value}
                    className="w-full pl-9"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" className={buttonVariants({ variant: "secondary", size: "md" })}>
              {submitLabel}
            </button>
            <Link href={clearHref} className={buttonVariants({ variant: "ghost", size: "md" })}>
              <X aria-hidden="true" className="size-4" />
              {clearLabel}
            </Link>
          </div>
        </form>
        <Link
          href={createHref}
          className={cn(buttonVariants({ variant: "primary", size: "md" }), "lg:mt-5")}
        >
          <Plus aria-hidden="true" className="size-4" />
          {createLabel}
        </Link>
      </div>
    </div>
  );
}