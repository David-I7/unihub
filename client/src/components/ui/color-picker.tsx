import * as React from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  computeGradient,
  isValidHex,
  normalizeHex,
} from "@/lib/gradientUtils";

export const DEFAULT_COMMUNITY_PRESETS = [
  "#2563EB", // Blue
  "#7C3AED", // Violet
  "#0D9488", // Teal
  "#059669", // Emerald
  "#EA580C", // Orange
  "#E11D48", // Rose
  "#DB2777", // Pink
  "#4F46E5", // Indigo
  "#D97706", // Amber
  "#0284C7", // Sky
];

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string, gradientCss: string) => void;
  presets?: string[];
  className?: string;
}

function ColorPickerComponent({
  value,
  defaultValue = "#2563EB",
  onChange,
  presets = DEFAULT_COMMUNITY_PRESETS,
  className,
}: ColorPickerProps) {
  const currentHex = value ?? defaultValue;
  const valid = isValidHex(currentHex);
  const normalizedHex = valid ? normalizeHex(currentHex) : "#2563EB";

  const [inputStr, setInputStr] = React.useState(currentHex);
  const [prevPropValue, setPrevPropValue] = React.useState(value);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const rafRef = React.useRef<number | null>(null);

  // Sync state without useEffect lag if parent changes value directly (e.g. preset clicked outside)
  if (value !== prevPropValue) {
    setPrevPropValue(value);
    setInputStr(value ?? defaultValue);
  }

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const emitChange = React.useCallback(
    (newHex: string) => {
      if (isValidHex(newHex)) {
        const norm = normalizeHex(newHex);
        onChange?.(norm, computeGradient(norm));
      }
    },
    [onChange],
  );

  const handlePresetClick = React.useCallback(
    (presetHex: string) => {
      setInputStr(presetHex);
      emitChange(presetHex);
    },
    [emitChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.length > 0 && !val.startsWith("#")) {
      val = `#${val}`;
    }
    setInputStr(val);
    emitChange(val);
  };

  // High-frequency native color picker events are batched via requestAnimationFrame for smooth 60fps
  const handleNativeColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputStr(rawVal);

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      emitChange(rawVal);
    });
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Hex Text Input & Color Native Swatch Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={inputStr}
            onChange={handleInputChange}
            placeholder="#2563EB"
            maxLength={7}
            aria-invalid={!isValidHex(inputStr) && inputStr.length > 0}
            className="font-mono text-xs uppercase tracking-wider h-9 rounded-xl"
          />
        </div>

        {/* Native Color Picker Trigger */}
        <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-input shadow-xs">
          <button
            type="button"
            className="size-full cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: normalizedHex }}
            onClick={() => colorInputRef.current?.click()}
            title="Open color palette"
            aria-label="Open color picker"
          />
          <input
            ref={colorInputRef}
            type="color"
            value={normalizedHex}
            onChange={handleNativeColorInput}
            className="pointer-events-none absolute -inset-4 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Preset Color Swatches */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {presets.map((preset) => {
            const isSelected =
              normalizedHex.toLowerCase() === preset.toLowerCase();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "group relative size-6.5 cursor-pointer rounded-lg border border-black/15 shadow-2xs transition-all hover:scale-110 flex items-center justify-center",
                  isSelected && "ring-2 ring-primary ring-offset-1",
                )}
                style={{ backgroundColor: preset }}
                title={preset}
                aria-label={`Select color ${preset}`}
              >
                {isSelected && (
                  <Check className="size-3.5 text-white stroke-[3] drop-shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const ColorPicker = React.memo(ColorPickerComponent);
