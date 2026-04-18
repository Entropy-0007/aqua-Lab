/**
 * Defines branded physical quantity units and type-level constructors for safe unit handling.
 */

declare const millilitersBrand: unique symbol;
declare const molesBrand: unique symbol;
declare const molesPerLiterBrand: unique symbol;
declare const milligramsBrand: unique symbol;
declare const milligramsPerLiterBrand: unique symbol;
declare const celsiusBrand: unique symbol;
declare const secondsBrand: unique symbol;
declare const percentageBrand: unique symbol;

/** Represents a liquid volume in milliliters. */
export type Milliliters = number & { readonly [millilitersBrand]: 'Milliliters' };

/** Represents amount of substance in moles. */
export type Moles = number & { readonly [molesBrand]: 'Moles' };

/** Represents molar concentration in moles per liter. */
export type MolesPerLiter = number & { readonly [molesPerLiterBrand]: 'MolesPerLiter' };

/** Represents mass in milligrams. */
export type Milligrams = number & { readonly [milligramsBrand]: 'Milligrams' };

/** Represents concentration in milligrams per liter. */
export type MilligramsPerLiter = number & {
  readonly [milligramsPerLiterBrand]: 'MilligramsPerLiter';
};

/** Represents temperature in Celsius. */
export type Celsius = number & { readonly [celsiusBrand]: 'Celsius' };

/** Represents elapsed time in seconds. */
export type Seconds = number & { readonly [secondsBrand]: 'Seconds' };

/** Represents a percentage value. */
export type Percentage = number & { readonly [percentageBrand]: 'Percentage' };

/** Type-level constructor for milliliters. */
export declare function toMilliliters(_n: number): Milliliters;

/** Type-level constructor for moles. */
export declare function toMoles(_n: number): Moles;

/** Type-level constructor for moles per liter. */
export declare function toMolesPerLiter(_n: number): MolesPerLiter;

/** Type-level constructor for milligrams. */
export declare function toMilligrams(_n: number): Milligrams;

/** Type-level constructor for milligrams per liter. */
export declare function toMilligramsPerLiter(_n: number): MilligramsPerLiter;

/** Type-level constructor for Celsius. */
export declare function toCelsius(_n: number): Celsius;

/** Type-level constructor for seconds. */
export declare function toSeconds(_n: number): Seconds;

/** Type-level constructor for percentage. */
export declare function toPercentage(_n: number): Percentage;

/** Represents any supported branded physical quantity type. */
export type PhysicalQuantity =
  | Milliliters
  | Moles
  | MolesPerLiter
  | Milligrams
  | MilligramsPerLiter
  | Celsius
  | Seconds
  | Percentage;

