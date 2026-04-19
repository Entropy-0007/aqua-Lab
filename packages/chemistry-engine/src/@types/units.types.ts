/**
 * Declares branded physical quantity units used by the chemistry engine.
 */

declare const millilitersBrand: unique symbol;
declare const molesBrand: unique symbol;
declare const molesPerLiterBrand: unique symbol;
declare const milligramsPerLiterBrand: unique symbol;
declare const percentageBrand: unique symbol;
declare const secondsBrand: unique symbol;

/** Represents volume in milliliters. */
export type Milliliters = number & { readonly [millilitersBrand]: 'Milliliters' };

/** Represents amount of substance in moles. */
export type Moles = number & { readonly [molesBrand]: 'Moles' };

/** Represents concentration in moles per liter. */
export type MolesPerLiter = number & { readonly [molesPerLiterBrand]: 'MolesPerLiter' };

/** Represents concentration in milligrams per liter. */
export type MilligramsPerLiter = number & {
  readonly [milligramsPerLiterBrand]: 'MilligramsPerLiter';
};

/** Represents a percentage value. */
export type Percentage = number & { readonly [percentageBrand]: 'Percentage' };

/** Represents time in seconds. */
export type Seconds = number & { readonly [secondsBrand]: 'Seconds' };

