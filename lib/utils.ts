import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Quantity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const unitConversionTable: { [unit: string]: { toMl: number } } = {
  ml: { toMl: 1 },
  liter: { toMl: 1000 },
  bottle: { toMl: 720 }, // Example: 1 bottle = 720 ml
  spoon: { toMl: 5 }, // Example: 1 spoon = 5 ml (teaspoon)
  tablespoon: { toMl: 15 }, // Example: 1 tablespoon = 15 ml
  cup: { toMl: 240 }, // Example: 1 cup = 240 ml
  // Add more conversions as needed
};

function convertToMl(quantity: Quantity): number | null {
  const unit = Object.keys(quantity)[0];
  const value = Number(Object.values(quantity)[0]);

  if (unitConversionTable[unit]) {
    return value * unitConversionTable[unit].toMl;
  }
  return null; // Unit not found in conversion table
}

export function compareQuantity(need: Quantity, have: Quantity): [number, number] {
  const needUnit = Object.keys(need)[0];
  const haveUnit = Object.keys(have)[0];

  let convertedNeedValue: number | null = null;
  let convertedHaveValue: number | null = null;

  // Attempt to convert both to milliliters if units are different or if explicit conversion is needed
  if (needUnit !== haveUnit) {
    convertedNeedValue = convertToMl(need);
    convertedHaveValue = convertToMl(have);

    if (convertedNeedValue === null || convertedHaveValue === null) {
      // If conversion fails for either, treat as non-comparable by unit
      return [Number(Object.values(need)[0]), 0];
    }
  } else {
    // If units are the same, use original values
    convertedNeedValue = Number(Object.values(need)[0]);
    convertedHaveValue = Number(Object.values(have)[0]);
  }

  if (convertedHaveValue >= convertedNeedValue) {
    const remainingInFridge = convertedHaveValue - convertedNeedValue;
    return [0, remainingInFridge];
  } else {
    const neededToBuy = convertedNeedValue - convertedHaveValue;
    return [neededToBuy, 0];
  }
}
