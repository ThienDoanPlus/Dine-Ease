import React from "react";
import { cn } from "@/lib/utils";

interface BookingStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  const steps = [
    { num: 1, label: "Thông tin" },
    { num: 2, label: "Thanh toán" },
    { num: 3, label: "Hoàn tất" },
  ];

  return (
    <div className="mb-12 flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.num;
        const isPast = currentStep > step.num;
        const isFuture = currentStep < step.num;

        return (
          <React.Fragment key={step.num}>
            {/* Vòng tròn & Text */}
            <div className={cn("flex items-center gap-2 transition-all", isFuture && "opacity-40")}>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isActive || isPast
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                    : "bg-stone-200 text-stone-500"
                )}
              >
                {step.num}
              </div>
              <span
                className={cn(
                  "text-sm font-bold hidden sm:block",
                  isActive || isPast ? "text-stone-800" : "text-stone-400"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Thanh kẻ ngang (Không in thanh kẻ sau step cuối) */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-8 sm:w-12 transition-colors",
                  isPast ? "bg-amber-200" : "bg-stone-200"
                )}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
