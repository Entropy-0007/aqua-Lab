/**
 * Declares branded physical quantity units for the standalone physics engine.
 */

declare const millilitersBrand: unique symbol;
declare const millilitersPerSecondBrand: unique symbol;
declare const molesBrand: unique symbol;
declare const molesPerLiterBrand: unique symbol;
declare const secondsBrand: unique symbol;
declare const percentageBrand: unique symbol;

/** Represents liquid volume in milliliters. */
export type Milliliters = number & { readonly [millilitersBrand]: 'Milliliters' };

/** Represents volumetric flow in milliliters per second. */
export type MillilitersPerSecond = number & {
  readonly [millilitersPerSecondBrand]: 'MillilitersPerSecond';
};

/** Represents amount of substance in moles. */
export type Moles = number & { readonly [molesBrand]: 'Moles' };

/** Represents concentration in mol/L. */
export type MolesPerLiter = number & { readonly [molesPerLiterBrand]: 'MolesPerLiter' };

/** Represents elapsed time in seconds. */
export type Seconds = number & { readonly [secondsBrand]: 'Seconds' };

/** Represents percentage values. */
export type Percentage = number & { readonly [percentageBrand]: 'Percentage' };

