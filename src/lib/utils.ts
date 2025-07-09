import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getRandomColor = () => {
  const minComponent = 100; // Minimum value for R, G, B to ensure brightness
  const r = Math.floor(Math.random() * (256 - minComponent)) + minComponent;
  const g = Math.floor(Math.random() * (256 - minComponent)) + minComponent;
  const b = Math.floor(Math.random() * (256 - minComponent)) + minComponent;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
}