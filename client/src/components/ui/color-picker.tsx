import * as React from "react";
import { Dices, Check, Copy, CheckCheck, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  computeGradient,
  computeGradientDetails,
  generateRandomVibrantColor,
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
  /**
   * Controlled hex value (e.g. "#2563EB").
   */
  value?: string;
  /**
   * Default hex value for uncontrolled state.
   */
  defaultValue?: string;
  /**
   * Callback fired when hex or gradient changes.
   */
  onChange?: (hex: string, gradientCss: string) => void;
  /**
   * Label shown in CardTitle.
   */
  label?: string;
  /**
   * Optional helper text shown in CardDescription.
   */
  description?: string;
  /**
   * Whether to show the live gradient preview banner.
   * @default true
   */
  showPreview?: boolean;
  /**
   * Whether to show preset color swatches.
   * @default true
   */
  showPresets?: boolean;
  /**
   * Array of preset hex strings.
   */
  presets?: string[];
  /**
   * Whether to show the randomize button in CardAction.
   * @default true
   */
  showRandomButton?: boolean;
  /**
   * Card size variant.
   */
  size?: "default" | "sm";
  /**
   * Optional container className.
   */
  className?: string;
}

export function ColorPicker({
  value: controlledValue,
  defaultValue = "#2563EB",
  onChange,
  label = "Community Theme Color",
  description = "Choose a start color. It will automatically fade into a rich dark shade.",
  showPreview = true,
  showPresets = true,
  presets = DEFAULT_COMMUNITY_PRESETS,
  showRandomButton = true,
  size = "default",
  className,
}: ColorPickerProps) {
  const isControlled = controlledValue !== undefined;
  const [internalHex, setInternalHex] = React.useState(defaultValue);
  const currentHex = isControlled ? controlledValue : internalHex;

  const [inputStr, setInputStr] = React.useState(currentHex);
  const [isCopied, setIsCopied] = React.useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  // Sync internal state if controlled value changes
  React.useEffect(() => {
    if (isControlled) {
      setInputStr(controlledValue);
    }
  }, [isControlled, controlledValue]);

  const valid = isValidHex(currentHex);
  const normalizedHex = valid ? normalizeHex(currentHex) : "#2563EB";
  const gradientDetails = React.useMemo(
    () => computeGradientDetails(normalizedHex),
    [normalizedHex]
  );

  const handleUpdate = (newHex: string) => {
    if (!isControlled) {
      setInternalHex(newHex);
    }
    setInputStr(newHex);
    if (isValidHex(newHex)) {
      const norm = normalizeHex(newHex);
      onChange?.(norm, computeGradient(norm));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Auto-add # if user starts typing without it
    if (val.length > 0 && !val.startsWith("#")) {
      val = `#${val}`;
    }
    setInputStr(val);

    if (isValidHex(val)) {
      const norm = normalizeHex(val);
      if (!isControlled) {
        setInternalHex(norm);
      }
      onChange?.(norm, computeGradient(norm));
    }
  };

  const handleRandomize = () => {
    const randomHex = generateRandomVibrantColor();
    handleUpdate(randomHex);
  };

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradientDetails.css};`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <Card size={size} className={cn("overflow-hidden", className)}>
      {/* Shadcn Card Header */}
      {(label || description || showRandomButton) && (
        <CardHeader>
          {label && (
            <CardTitle className="flex items-center gap-1.5 text-xs font-bold">
              <Palette className="size-3.5 text-primary" />
              {label}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}

          {showRandomButton && (
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleRandomize}
                className="gap-1 font-semibold"
              >
                <Dices className="size-3 text-primary" />
                Randomize
              </Button>
            </CardAction>
          )}
        </CardHeader>
      )}

      {/* Shadcn Card Content */}
      <CardContent className="space-y-3">
        {/* Live Gradient Preview Strip */}
        {showPreview && (
          <div
            className="group relative flex h-20 w-full flex-col justify-between overflow-hidden rounded-lg p-3 text-white shadow-xs transition-all duration-300"
            style={{ background: gradientDetails.css }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-black/35 px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-xs">
                Live Gradient Preview
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleCopyCss}
                className="bg-black/30 text-white hover:bg-black/50 hover:text-white"
                title="Copy CSS gradient"
              >
                {isCopied ? (
                  <CheckCheck className="size-3.5 text-emerald-300" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] font-medium text-white/80">
              <span>{normalizedHex}</span>
              <span>→</span>
              <span>{gradientDetails.endHex}</span>
            </div>
          </div>
        )}

        {/* Shadcn Input & Color Native Swatch */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={inputStr}
              onChange={handleInputChange}
              placeholder="#2563EB"
              maxLength={7}
              aria-invalid={!isValidHex(inputStr) && inputStr.length > 0}
              className="font-mono text-xs uppercase tracking-wider"
            />
          </div>

          {/* Native Color Picker Trigger Box */}
          <div className="relative size-8 shrink-0 overflow-hidden rounded-lg border border-input shadow-xs">
            <button
              type="button"
              className="size-full cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: normalizedHex }}
              onClick={() => colorInputRef.current?.click()}
              title="Click to open system color picker"
              aria-label="Open color picker"
            />
            <input
              ref={colorInputRef}
              type="color"
              value={normalizedHex}
              onChange={(e) => handleUpdate(e.target.value)}
              className="pointer-events-none absolute -inset-4 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Preset Color Swatches */}
        {showPresets && presets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {presets.map((preset) => {
              const isSelected =
                normalizedHex.toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleUpdate(preset)}
                  className={cn(
                    "group relative size-6 cursor-pointer rounded-md border border-black/15 shadow-2xs transition-all hover:scale-110 flex items-center justify-center",
                    isSelected && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: preset }}
                  title={preset}
                  aria-label={`Select color ${preset}`}
                >
                  {isSelected && (
                    <Check className="size-3 text-white stroke-[3] drop-shadow-xs" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
