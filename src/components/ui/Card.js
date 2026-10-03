import { cn } from "@/lib/utils/cn";

export function Card({ className, as: Tag = "div", ...props }) {
  return <Tag className={cn("rounded-2xl border border-line bg-surface shadow-sm", className)} {...props} />;
}
