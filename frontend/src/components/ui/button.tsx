import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // BASE STYLE: Các thuộc tính dùng chung cho MỌI nút
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent font-bold transition-all outline-none select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* --- ADMIN & RESTAURANT VARIANTS --- */
        default: "bg-brand-dark text-white hover:bg-brand-dark-hover shadow-md",
        primary: "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30",
        outline: "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 shadow-sm",
        "outline-primary": "border-2 border-amber-400 bg-amber-50/50 text-amber-700 hover:bg-amber-100",
        ghost: "hover:bg-stone-100 text-stone-500 hover:text-brand-dark",
        light: "bg-stone-100 text-stone-600 hover:bg-stone-200",

        /* --- CUSTOMER VARIANTS (NEW) --- */
        customer: "bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:from-amber-600 hover:to-orange-500 shadow-xl shadow-amber-500/30",
        "customer-outline": "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100",
        "customer-dark": "bg-[#2D2318] text-white hover:bg-black shadow-xl shadow-stone-800/20",
      },
      size: {
        /* --- ADMIN SIZES --- */
        default: "h-10 px-4 py-2 rounded-xl text-sm gap-2",
        sm: "h-8 px-3 py-1.5 rounded-lg text-xs gap-1.5",
        lg: "px-6 py-3 rounded-xl text-sm gap-2",
        xl: "px-8 py-3.5 rounded-2xl text-base gap-2",
        icon: "size-10 rounded-xl",
        "icon-sm": "size-8 rounded-lg",

        /* --- CUSTOMER SIZES (NEW) --- */
        // Nút to tròn 24px chuyên dùng ở trang Đặt bàn, Thanh toán
        customer: "h-[60px] px-8 py-4 rounded-2xl text-base font-black gap-3", 
      },
      uppercase: {
        true: "uppercase tracking-widest text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive>,
    VariantProps<typeof buttonVariants> {
  uppercase?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  uppercase,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, uppercase, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
