import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const actionIconVariants = cva(
  "p-2.5 text-stone-400 rounded-xl transition-all border border-transparent",
  {
    variants: {
      actionType: {
        edit: "hover:text-primary-hover hover:bg-amber-50",
        delete: "hover:text-rose-600 hover:bg-rose-50",
        view: "hover:text-brand-dark hover:bg-stone-100",
        approve: "hover:text-emerald-600 hover:bg-emerald-50",
        lock: "hover:text-rose-600 hover:bg-rose-50",
        unlock: "hover:text-emerald-600 hover:bg-emerald-50",
        retry: "hover:text-primary-hover hover:bg-amber-50",
      },
    },
    defaultVariants: {
      actionType: "view",
    },
  }
);

export interface ActionIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof actionIconVariants> {
  icon: LucideIcon;
  title: string;
  href?: string;
}

export function ActionIconButton({
  icon: Icon,
  actionType,
  title,
  href,
  className,
  ...props
}: ActionIconButtonProps) {
  const buttonClass = cn(actionIconVariants({ actionType, className }));

  if (href) {
    return (
      <Link href={href} className={buttonClass} title={title}>
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </Link>
    );
  }

  return (
    <button className={buttonClass} title={title} {...props}>
      <Icon className="h-4 w-4" strokeWidth={2.5} />
    </button>
  );
}
