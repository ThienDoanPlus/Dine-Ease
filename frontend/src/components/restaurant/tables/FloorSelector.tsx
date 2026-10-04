import React from "react";

interface FloorSelectorProps {
  currentFloor: number;
  onSelectFloor: (floor: number) => void;
  disabled?: boolean;
}

export function FloorSelector({ currentFloor, onSelectFloor, disabled }: FloorSelectorProps) {
  const floors = [1, 2, 3];

  return (
    <div className="no-scrollbar flex w-full items-center overflow-x-auto rounded-xl border border-stone-200 bg-stone-100/80 p-1.5 shadow-inner md:w-auto">
      {floors.map((floor) => (
        <button
          key={floor}
          onClick={() => onSelectFloor(floor)}
          disabled={disabled}
          className={`shrink-0 rounded-lg px-6 py-2 text-sm font-bold transition-all duration-300 ${
            currentFloor === floor
              ? "text-brand-dark border border-stone-200/50 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)]"
              : "border border-transparent text-stone-500 hover:text-stone-700 disabled:opacity-50"
          }`}
        >
          {floor === 3 ? "Sân thượng" : `Tầng ${floor}`}
        </button>
      ))}
    </div>
  );
}
