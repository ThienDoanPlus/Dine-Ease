import React, { memo } from "react";
import { ArchitecturalElement } from "./types";
import { cn } from "@/lib/utils";

interface ArchitecturalNodeProps {
  element: ArchitecturalElement;
  isEditMode: boolean;
}

export const ArchitecturalNode = memo(function ArchitecturalNode({ element, isEditMode }: ArchitecturalNodeProps) {
  const isWall = element.type === "wall";
  const isDoor = element.type === "door";

  return (
    <div
      className={cn(
        "flex w-full h-full items-center justify-center overflow-hidden",
        isWall && "bg-stone-300 border-none rounded-sm",
        isDoor && "border-4 border-amber-600 bg-amber-50 rounded-md border-dashed",
        element.type === "decor" && "bg-stone-100 border border-stone-300 rounded-xl"
      )}
      style={element.color ? { backgroundColor: element.color } : {}}
    >
      {/* ĐÃ CHỈNH SỬA: Tăng từ text-[10px] lên text-sm, text-stone-800 cho rõ nét */}
      {element.label && (
        <span className="text-sm font-black text-stone-800 truncate px-2 text-center select-none pointer-events-none drop-shadow-sm">
          {element.label}
        </span>
      )}
    </div>
  );
});
