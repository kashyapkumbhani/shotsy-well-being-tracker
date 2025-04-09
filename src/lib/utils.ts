
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "PPP"): string {
  return format(new Date(date), formatStr);
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), "h:mm a");
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "MM/dd/yy");
}

export function generateId(): string {
  return uuidv4();
}

export function getDaysSince(date: string | Date): number {
  const pastDate = new Date(date);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - pastDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatWeight(weight: number, useMetric: boolean): string {
  if (useMetric) {
    return `${weight.toFixed(1)}kg`;
  }
  return `${weight.toFixed(1)}lbs`;
}

export function getMotivationalQuote(): string {
  const quotes = [
    "Every step forward is a step worth taking.",
    "Small, consistent efforts lead to big changes.",
    "Your health journey matters. So do you.",
    "Progress is progress, no matter how small.",
    "Be patient with yourself. Health changes take time.",
    "Today's choices shape tomorrow's health.",
    "Celebrate each milestone, no matter how small.",
    "You've got this. One day at a time.",
    "Your commitment to yourself is inspiring.",
    "Focus on progress, not perfection.",
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}
