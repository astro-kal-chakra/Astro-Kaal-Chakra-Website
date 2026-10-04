import { cn } from "@/lib/utils/cn";

/** `interactive` adds the hover lift + saffron edge used for clickable cards. */
export function Card({ className, as: Tag = "div", interactive = false, ...props }) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgb(120_53_15/0.04)]",
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_10px_30px_-12px_rgb(194_65_12/0.25)] dark:hover:border-brand-700",
        className
      )}
      {...props}
    />
  );
}
