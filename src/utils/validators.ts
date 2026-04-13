export function isValidWeight(val: string | number): boolean {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return !isNaN(n) && n > 0 && n < 1000;
}

export function isValidCalories(val: string | number): boolean {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return !isNaN(n) && n >= 0 && n < 10000;
}

export function isValidMacro(val: string | number): boolean {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return !isNaN(n) && n >= 0 && n < 2000;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}
