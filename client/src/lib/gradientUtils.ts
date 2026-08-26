/**
 * Utilities for computing gradients and manipulating hex colors.
 */

export interface HSL {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
}

export interface GradientOptions {
  /**
   * Direction or angle of the gradient. e.g. 135 or "135deg" or "to right".
   * @default 135
   */
  angle?: number | string;
  /**
   * Number of gradient stops: 2 or 3.
   * @default 3
   */
  stops?: 2 | 3;
  /**
   * Lightness percentage for the middle stop (0 - 100).
   * @default 22
   */
  midLightness?: number;
  /**
   * Lightness percentage for the dark ending stop (0 - 100).
   * @default 8
   */
  endLightness?: number;
  /**
   * Degrees of hue shift applied to darker stops for richer, non-muddy shadows.
   * @default 10
   */
  hueShift?: number;
}

export interface GradientResult {
  startHex: string;
  midHex?: string;
  endHex: string;
  css: string;
}

/**
 * Validates whether a string is a valid 3, 4, 6, or 8 character hex color.
 */
export function isValidHex(hex: string): boolean {
  if (!hex || typeof hex !== "string") return false;
  const clean = hex.trim().replace(/^#/, "");
  return /^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(clean);
}

/**
 * Normalizes any valid hex string into a standard uppercase 6-character '#RRGGBB' format.
 */
export function normalizeHex(hex: string): string {
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3 || clean.length === 4) {
    clean = clean
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (clean.length > 6) {
    clean = clean.slice(0, 6);
  }
  return `#${clean.toUpperCase()}`;
}

/**
 * Converts a hex color string to HSL object.
 */
export function hexToHsl(hex: string): HSL {
  const norm = isValidHex(hex) ? normalizeHex(hex).replace(/^#/, "") : "3B82F6";
  const r = parseInt(norm.substring(0, 2), 16) / 255;
  const g = parseInt(norm.substring(2, 4), 16) / 255;
  const b = parseInt(norm.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return {
    h: (h + 360) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL values to a standard 6-character uppercase hex string.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const normalizedH = ((h % 360) + 360) % 360;
  const normalizedS = Math.min(100, Math.max(0, s)) / 100;
  const normalizedL = Math.min(100, Math.max(0, l)) / 100;

  const k = (n: number) => (n + normalizedH / 30) % 12;
  const a = normalizedS * Math.min(normalizedL, 1 - normalizedL);
  const f = (n: number) =>
    normalizedL - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

/**
 * Computes a darker shade of a given hex color.
 *
 * @param hex Input hex color.
 * @param targetLightness Target lightness percentage (0 - 100). Default is 12%.
 * @param hueShift Degrees to shift the hue. Default is 8deg.
 */
export function computeDarkShade(
  hex: string,
  targetLightness = 12,
  hueShift = 8
): string {
  const hsl = hexToHsl(hex);
  const newH = (hsl.h + hueShift) % 360;
  const newS = Math.min(hsl.s + 8, 100);
  return hslToHex(newH, newS, targetLightness);
}

/**
 * Computes a linear gradient CSS string fading from the provided hex start color to a darker shade.
 *
 * @param startHex The starting hex color (e.g., "#3B82F6" or "3B82F6").
 * @param options Configuration for angle, stops, lightness levels, and hue shift.
 * @returns CSS linear-gradient string.
 */
export function computeGradient(
  startHex: string,
  options: GradientOptions = {}
): string {
  return computeGradientDetails(startHex, options).css;
}

/**
 * Computes a theme-aware gradient that transitions smoothly:
 * - On Dark theme: from the community color down to a deep dark shade.
 * - On Light theme: maintains the rich community color through the header and starts the transition late towards the bottom.
 */
export function computeThemeGradient(
  startHex: string,
  isDark: boolean,
  angle: number | string = 180,
): string {
  const valid = isValidHex(startHex);
  const safeStartHex = valid ? normalizeHex(startHex) : "#3B82F6";
  const hsl = hexToHsl(safeStartHex);
  const angleStr = typeof angle === "number" ? `${angle}deg` : angle;

  if (isDark) {
    // Dark theme: vibrant start -> deep dark tone at bottom
    const midHex = hslToHex(
      (hsl.h + 6) % 360,
      Math.min(hsl.s + 5, 80),
      22,
    );
    const endHex = hslToHex(
      (hsl.h + 10) % 360,
      Math.min(hsl.s + 10, 60),
      9,
    );
    return `linear-gradient(${angleStr}, ${safeStartHex} 0%, ${safeStartHex} 40%, ${midHex} 70%, ${endHex} 100%)`;
  } else {
    // Light theme: hold vibrant color through top 65%, then transition late towards bottom
    const midHex = hslToHex(
      hsl.h,
      Math.min(hsl.s, 65),
      74,
    );
    const endHex = hslToHex(
      hsl.h,
      Math.min(hsl.s, 35),
      96,
    );
    return `linear-gradient(${angleStr}, ${safeStartHex} 0%, ${safeStartHex} 65%, ${midHex} 86%, ${endHex} 100%)`;
  }
}

/**
 * Computes detailed gradient information (individual stop colors + CSS string).
 */
export function computeGradientDetails(
  startHex: string,
  options: GradientOptions = {}
): GradientResult {
  const valid = isValidHex(startHex);
  const safeStartHex = valid ? normalizeHex(startHex) : "#3B82F6";

  const {
    angle = 135,
    stops = 3,
    midLightness = 22,
    endLightness = 8,
    hueShift = 10,
  } = options;

  const angleStr = typeof angle === "number" ? `${angle}deg` : angle;
  const hsl = hexToHsl(safeStartHex);

  if (stops === 2) {
    const endHex = hslToHex(
      (hsl.h + hueShift) % 360,
      Math.min(hsl.s + 10, 100),
      endLightness
    );
    return {
      startHex: safeStartHex,
      endHex,
      css: `linear-gradient(${angleStr}, ${safeStartHex} 0%, ${endHex} 100%)`,
    };
  }

  const midHex = hslToHex(
    (hsl.h + Math.round(hueShift * 0.6)) % 360,
    Math.min(hsl.s + 5, 95),
    midLightness
  );

  const endHex = hslToHex(
    (hsl.h + hueShift) % 360,
    Math.min(hsl.s + 10, 95),
    endLightness
  );

  return {
    startHex: safeStartHex,
    midHex,
    endHex,
    css: `linear-gradient(${angleStr}, ${safeStartHex} 0%, ${midHex} 52%, ${endHex} 100%)`,
  };
}

/**
 * Generates a random vibrant hex color ideal for community backgrounds.
 */
export function generateRandomVibrantColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 25) + 70; // 70% - 95% saturation
  const l = Math.floor(Math.random() * 12) + 48; // 48% - 60% lightness
  return hslToHex(h, s, l);
}

/**
 * Deterministically generates a vibrant start color from a string (e.g. community ID or name).
 */
export function getColorFromString(seed: string): string {
  if (!seed) return "#3B82F6";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return hslToHex(h, 75, 50);
}
