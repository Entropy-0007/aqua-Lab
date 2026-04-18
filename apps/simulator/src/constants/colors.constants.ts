/**
 * Defines canonical color palettes and opacity mappings for chemistry and lab visualization.
 */

/** Initial indicator state before appreciable EDTA complex displacement. */
const INDICATOR_INITIAL_RED_HEX = '#C0392B';
/** Transitional indicator hue as endpoint approaches in mixed solution. */
const INDICATOR_NEAR_ENDPOINT_PINK_HEX = '#D988A8';
/** Endpoint color when free Eriochrome Black T dominates the visible solution. */
const INDICATOR_AT_ENDPOINT_BLUE_HEX = '#1B6CA8';
/** Distilled-water visual baseline for neutral comparison. */
const DISTILLED_REFERENCE_HEX = '#E8F6FF';

/** Typical laminated lab bench surface tone used in educational chemistry rooms. */
const LAB_BENCH_SURFACE_HEX = '#8B7355';
/** Neutral light wall color to preserve contrast with transparent glassware. */
const LAB_WALL_HEX = '#E6ECEF';
/** Bright ceiling tone used to simulate diffuse classroom illumination. */
const LAB_CEILING_HEX = '#F8FAFC';
/** Borosilicate glass tint used for vessel material highlights. */
const LAB_EQUIPMENT_GLASS_HEX = '#DDEAF5';
/** Plastic material tint for wash bottles and polymer accessories. */
const LAB_EQUIPMENT_PLASTIC_HEX = '#F1F5F9';
/** Stainless-steel accent color for clips, clamps, and support rods. */
const LAB_EQUIPMENT_METAL_HEX = '#AAB4BE';

/** Volume key for very small liquid quantity opacity calibration. */
const LIQUID_VOLUME_10_ML = 10;
/** Volume key for small liquid quantity opacity calibration. */
const LIQUID_VOLUME_25_ML = 25;
/** Volume key for medium liquid quantity opacity calibration. */
const LIQUID_VOLUME_50_ML = 50;
/** Volume key for large liquid quantity opacity calibration. */
const LIQUID_VOLUME_100_ML = 100;
/** Volume key for very large liquid quantity opacity calibration. */
const LIQUID_VOLUME_250_ML = 250;

/** Opacity value for low-volume transparent liquid rendering. */
const OPACITY_AT_10_ML = 0.2;
/** Opacity value for small-volume liquid rendering. */
const OPACITY_AT_25_ML = 0.3;
/** Opacity value for medium-volume liquid rendering. */
const OPACITY_AT_50_ML = 0.45;
/** Opacity value for large-volume liquid rendering. */
const OPACITY_AT_100_ML = 0.6;
/** Opacity value for very large-volume liquid rendering. */
const OPACITY_AT_250_ML = 0.75;

/** Foam particle color inspired by aerated water highlights under lab lighting. */
const FOAM_PARTICLE_COLOR_HEX = '#F2F7FF';

/** Indicator-color stages observed across the EDTA titration workflow. */
export const INDICATOR_COLOR_STATES = Object.freeze({
  INITIAL_RED: INDICATOR_INITIAL_RED_HEX,
  NEAR_ENDPOINT_PINK: INDICATOR_NEAR_ENDPOINT_PINK_HEX,
  AT_ENDPOINT_BLUE: INDICATOR_AT_ENDPOINT_BLUE_HEX,
  DISTILLED_REFERENCE: DISTILLED_REFERENCE_HEX,
} as const);

/** Environment and material colors for consistent lab-scene visual identity. */
export const LAB_ENVIRONMENT_COLORS = Object.freeze({
  benchSurface: LAB_BENCH_SURFACE_HEX,
  wall: LAB_WALL_HEX,
  ceiling: LAB_CEILING_HEX,
  equipmentMaterials: Object.freeze({
    borosilicateGlass: LAB_EQUIPMENT_GLASS_HEX,
    plastic: LAB_EQUIPMENT_PLASTIC_HEX,
    metal: LAB_EQUIPMENT_METAL_HEX,
  }),
} as const);

/** Volume-to-opacity references for representing optical density in transparent vessels. */
export const LIQUID_TRANSPARENCY_BY_VOLUME = Object.freeze({
  [LIQUID_VOLUME_10_ML]: OPACITY_AT_10_ML,
  [LIQUID_VOLUME_25_ML]: OPACITY_AT_25_ML,
  [LIQUID_VOLUME_50_ML]: OPACITY_AT_50_ML,
  [LIQUID_VOLUME_100_ML]: OPACITY_AT_100_ML,
  [LIQUID_VOLUME_250_ML]: OPACITY_AT_250_ML,
} as const);

/** Foam-particle color used for swirl and agitation visual effects. */
export const FOAM_PARTICLE_COLOR = FOAM_PARTICLE_COLOR_HEX;
