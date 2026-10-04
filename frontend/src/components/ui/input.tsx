import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  // BASE STYLE
  "w-full bg-stone-50 border-2 border-stone-100 rounded-xl font-bold text-brand-dark placeholder:text-stone-400 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 focus:bg-white hover:border-stone-200",
        error:
          "border-rose-300 focus:ring-4 focus:ring-rose-400/20 focus:border-rose-400 focus:bg-white text-rose-600",
        
        /* --- CUSTOMER VARIANT (NEW) --- */
        // Dành cho ô Search, Login, Thanh toán của User
        customer: "border-stone-100 bg-stone-50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-400/20 hover:border-amber-400 font-medium",
      },
      size: {
        default: "py-3 px-4 text-sm",
        lg: "py-3.5 px-5 text-base",
        sm: "py-2 px-3 text-xs",

        /* --- CUSTOMER SIZES (NEW) --- */
        // Ô input to bình thường
        customer: "py-4 px-5 rounded-2xl text-base",
        // Ô input to nhưng CHỪA CHỖ TRỐNG BÊN TRÁI ĐỂ NHÉT ICON
        "customer-icon": "py-4 pr-5 pl-12 rounded-2xl text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "size">,
    VariantProps<typeof inputVariants> {}

function Input({ className, variant, size, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input, inputVariants };
