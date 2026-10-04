import React from "react";
import { Delete } from "lucide-react";

interface PosNumpadProps {
  disabled: boolean;
  onKeyPress: (key: string) => void;
  onClear: () => void;
  onDelete: () => void;
  onEnter?: () => void;
}

export function PosNumpad({ disabled, onKeyPress, onClear, onDelete, onEnter }: PosNumpadProps) {
  const NumpadBtn = ({ val, onClick, isFunc = false, className = "" }: any) => (
    <button
      disabled={disabled}
      onClick={() => onClick(val)}
      className={`flex h-full w-full items-center justify-center rounded-xl border border-b-4 text-lg font-bold shadow-sm transition-all select-none active:scale-[0.92] disabled:cursor-not-allowed disabled:opacity-50 lg:text-xl ${isFunc ? "border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 active:border-b" : "text-brand-dark hover:text-amber-600 border-stone-100 bg-white hover:border-amber-200 hover:bg-amber-50 active:border-b"} ${className} `}
    >
      {val}
    </button>
  );

  return (
    <div className="grid h-full w-full flex-1 grid-cols-5 grid-rows-4 gap-2">
      {/* Row 1 */}
      <NumpadBtn val="7" onClick={onKeyPress} />
      <NumpadBtn val="8" onClick={onKeyPress} />
      <NumpadBtn val="9" onClick={onKeyPress} />
      <NumpadBtn val="C" onClick={onClear} isFunc className="!font-black !text-rose-500" />
      <NumpadBtn val={<Delete className="h-5 w-5 lg:h-6 lg:w-6" />} onClick={onDelete} isFunc />

      {/* Row 2 */}
      <NumpadBtn val="4" onClick={onKeyPress} />
      <NumpadBtn val="5" onClick={onKeyPress} />
      <NumpadBtn val="6" onClick={onKeyPress} />
      <NumpadBtn val="×" onClick={() => onKeyPress("x")} isFunc />
      <NumpadBtn val="÷" onClick={() => onKeyPress("/")} isFunc />

      {/* Row 3 */}
      <NumpadBtn val="1" onClick={onKeyPress} />
      <NumpadBtn val="2" onClick={onKeyPress} />
      <NumpadBtn val="3" onClick={onKeyPress} />
      <NumpadBtn val="+" onClick={() => onKeyPress("+")} isFunc />
      <NumpadBtn val="−" onClick={() => onKeyPress("-")} isFunc />

      {/* Row 4 */}
      <NumpadBtn val="#" onClick={() => onKeyPress("#")} isFunc />
      <NumpadBtn val="0" onClick={onKeyPress} />
      <NumpadBtn val="." onClick={() => onKeyPress(".")} />

      {/* Nút bằng (=) */}
      <button
        onClick={onEnter}
        disabled={disabled}
        className="bg-brand-dark col-span-2 flex h-full w-full items-center justify-center rounded-xl border-b-4 border-stone-950 text-2xl font-black text-white shadow-md transition-all hover:bg-stone-800 active:translate-y-1 active:scale-[0.95] active:border-b-0 disabled:opacity-50 lg:text-3xl"
      >
        =
      </button>
    </div>
  );
}
