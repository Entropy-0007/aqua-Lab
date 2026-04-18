/**
 * Defines real-world glassware dimensions and usage thresholds for lab equipment simulation.
 */

import type { GlasswareId, GlasswareSpec } from '../types/glassware.types';
import { GlasswareId as GlasswareIdEnum, GlasswareMaterial } from '../types/glassware.types';
import type { Milliliters } from '../types/units.types';

/** ISO 385-style educational burette nominal capacity. */
const BURETTE_MAX_CAPACITY_ML = 50 as Milliliters;
/** Typical burette graduation interval for titration readability. */
const BURETTE_GRADUATION_INTERVAL_ML = 0.1 as Milliliters;
/** Typical inner tube radius for a 50 mL glass burette. */
const BURETTE_INNER_RADIUS_MM = 4.5;
/** Typical total burette body height including graduation section. */
const BURETTE_HEIGHT_MM = 640;

/** Common 250 mL Erlenmeyer nominal capacity. */
const CONICAL_FLASK_MAX_CAPACITY_ML = 250 as Milliliters;
/** Broad printed volume marks for conical flasks are not analytical-grade. */
const CONICAL_FLASK_GRADUATION_INTERVAL_ML = 25 as Milliliters;
/** Approximate base inner radius for a 250 mL Erlenmeyer profile. */
const CONICAL_FLASK_INNER_RADIUS_MM = 45;
/** Typical 250 mL Erlenmeyer vessel height. */
const CONICAL_FLASK_HEIGHT_MM = 145;
/** Typical Erlenmeyer neck inner radius. */
const CONICAL_FLASK_NECK_RADIUS_MM = 14;

/** Common 25 mL volumetric pipette transfer volume. */
const PIPETTE_MAX_CAPACITY_ML = 25 as Milliliters;
/** Type-level placeholder for single-mark glassware where interval is not applicable. */
const SINGLE_MARK_GRADUATION_PLACEHOLDER_ML = 0 as Milliliters;
/** Typical inner radius for a 25 mL volumetric pipette stem. */
const PIPETTE_INNER_RADIUS_MM = 3;
/** Typical overall length of a 25 mL volumetric pipette. */
const PIPETTE_HEIGHT_MM = 450;
/** Typical neck/stem radius for volumetric pipette geometry. */
const PIPETTE_NECK_RADIUS_MM = 3;

/** Common 100 mL volumetric flask nominal capacity. */
const VOLUMETRIC_FLASK_MAX_CAPACITY_ML = 100 as Milliliters;
/** Typical bulb inner radius for a 100 mL volumetric flask. */
const VOLUMETRIC_FLASK_INNER_RADIUS_MM = 30;
/** Typical total height for a 100 mL volumetric flask. */
const VOLUMETRIC_FLASK_HEIGHT_MM = 160;
/** Typical neck radius for a 100 mL volumetric flask. */
const VOLUMETRIC_FLASK_NECK_RADIUS_MM = 8;

/** Common 250 mL beaker nominal capacity. */
const BEAKER_250_MAX_CAPACITY_ML = 250 as Milliliters;
/** Typical broad graduation increment on teaching-lab 250 mL beakers. */
const BEAKER_250_GRADUATION_INTERVAL_ML = 25 as Milliliters;
/** Typical inner radius near upper body of a 250 mL beaker. */
const BEAKER_250_INNER_RADIUS_MM = 35;
/** Typical body height of a 250 mL beaker. */
const BEAKER_250_HEIGHT_MM = 95;
/** Typical lip radius around 250 mL beaker spout opening. */
const BEAKER_250_NECK_RADIUS_MM = 35;

/** Common 100 mL beaker nominal capacity. */
const BEAKER_100_MAX_CAPACITY_ML = 100 as Milliliters;
/** Typical broad graduation increment on teaching-lab 100 mL beakers. */
const BEAKER_100_GRADUATION_INTERVAL_ML = 10 as Milliliters;
/** Typical inner radius near upper body of a 100 mL beaker. */
const BEAKER_100_INNER_RADIUS_MM = 25;
/** Typical body height of a 100 mL beaker. */
const BEAKER_100_HEIGHT_MM = 70;
/** Typical lip radius around 100 mL beaker spout opening. */
const BEAKER_100_NECK_RADIUS_MM = 25;

/** Common 100 mL measuring cylinder nominal capacity for preparative volumes. */
const MEASURING_CYLINDER_MAX_CAPACITY_ML = 100 as Milliliters;
/** Typical 1 mL interval on educational measuring cylinders. */
const MEASURING_CYLINDER_GRADUATION_INTERVAL_ML = 1 as Milliliters;
/** Typical inner radius for a 100 mL graduated cylinder. */
const MEASURING_CYLINDER_INNER_RADIUS_MM = 12;
/** Typical total height of a 100 mL graduated cylinder. */
const MEASURING_CYLINDER_HEIGHT_MM = 260;
/** Neck radius represented as tube radius for cylinder profile. */
const MEASURING_CYLINDER_NECK_RADIUS_MM = 12;

/** Common squeeze wash bottle practical fill volume in school and undergraduate labs. */
const WASH_BOTTLE_MAX_CAPACITY_ML = 500 as Milliliters;
/** Wash bottles are not graduated analytical measuring tools. */
const WASH_BOTTLE_GRADUATION_INTERVAL_ML = 50 as Milliliters;
/** Typical body radius for a 500 mL wash bottle. */
const WASH_BOTTLE_INNER_RADIUS_MM = 40;
/** Typical height for a 500 mL polyethylene wash bottle including shoulder. */
const WASH_BOTTLE_HEIGHT_MM = 220;
/** Typical neck radius for wash bottle cap region. */
const WASH_BOTTLE_NECK_RADIUS_MM = 15;

/** Geometric optimum for burette meniscus reading to minimize parallax. */
const BURETTE_OPTIMAL_EYE_LEVEL_ANGLE_DEGREES = 0;
/** Practical eye-level tolerance before visible reading bias appears. */
const BURETTE_READING_ANGLE_TOLERANCE_DEGREES = 5;
/** Typical upper-bound parallax magnitude in mL for misaligned readings. */
const BURETTE_MAX_PARALLAX_ERROR_ML = 0.5 as Milliliters;

/** Typical rinse volume for burette pre-conditioning with titrant. */
const BURETTE_RINSE_VOLUME_ML = 10 as Milliliters;
/** Typical rinse volume for conical flask to remove residual contaminants. */
const CONICAL_FLASK_RINSE_VOLUME_ML = 20 as Milliliters;
/** Typical rinse volume for volumetric pipette pre-rinse step. */
const PIPETTE_RINSE_VOLUME_ML = 5 as Milliliters;
/** Typical rinse volume for volumetric flask cleanliness assurance. */
const VOLUMETRIC_FLASK_RINSE_VOLUME_ML = 15 as Milliliters;
/** Typical rinse volume for 250 mL beaker cleaning between stages. */
const BEAKER_250_RINSE_VOLUME_ML = 20 as Milliliters;
/** Typical rinse volume for 100 mL beaker cleaning between stages. */
const BEAKER_100_RINSE_VOLUME_ML = 10 as Milliliters;
/** Typical rinse volume for measuring cylinder decontamination. */
const MEASURING_CYLINDER_RINSE_VOLUME_ML = 10 as Milliliters;
/** Typical rinse volume dispensed from wash bottle for nozzle flushing. */
const WASH_BOTTLE_RINSE_VOLUME_ML = 15 as Milliliters;

/** Optical parameters used when estimating burette-reading parallax error. */
interface BuretteReadingOpticalGeometry {
  readonly eyeLevelOptimalAngle: number;
  readonly angleToleranceDegrees: number;
  readonly maxParallaxErrorMl: Milliliters;
}

/** Realistic physical specifications for all supported lab equipment. */
export const GLASSWARE_SPECS: Readonly<Record<GlasswareId, GlasswareSpec>> = Object.freeze({
  [GlasswareIdEnum.BURETTE]: Object.freeze({
    id: GlasswareIdEnum.BURETTE,
    displayName: 'Burette (50 mL)',
    maxCapacity: BURETTE_MAX_CAPACITY_ML,
    graduationInterval: BURETTE_GRADUATION_INTERVAL_ML,
    innerRadiusMm: BURETTE_INNER_RADIUS_MM,
    heightMm: BURETTE_HEIGHT_MM,
    neckRadiusMm: null,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.CONICAL_FLASK]: Object.freeze({
    id: GlasswareIdEnum.CONICAL_FLASK,
    displayName: 'Conical Flask (250 mL Erlenmeyer)',
    maxCapacity: CONICAL_FLASK_MAX_CAPACITY_ML,
    graduationInterval: CONICAL_FLASK_GRADUATION_INTERVAL_ML,
    innerRadiusMm: CONICAL_FLASK_INNER_RADIUS_MM,
    heightMm: CONICAL_FLASK_HEIGHT_MM,
    neckRadiusMm: CONICAL_FLASK_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.PIPETTE]: Object.freeze({
    id: GlasswareIdEnum.PIPETTE,
    displayName: 'Volumetric Pipette (25 mL)',
    maxCapacity: PIPETTE_MAX_CAPACITY_ML,
    graduationInterval: SINGLE_MARK_GRADUATION_PLACEHOLDER_ML,
    innerRadiusMm: PIPETTE_INNER_RADIUS_MM,
    heightMm: PIPETTE_HEIGHT_MM,
    neckRadiusMm: PIPETTE_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.VOLUMETRIC_FLASK]: Object.freeze({
    id: GlasswareIdEnum.VOLUMETRIC_FLASK,
    displayName: 'Volumetric Flask (100 mL)',
    maxCapacity: VOLUMETRIC_FLASK_MAX_CAPACITY_ML,
    graduationInterval: SINGLE_MARK_GRADUATION_PLACEHOLDER_ML,
    innerRadiusMm: VOLUMETRIC_FLASK_INNER_RADIUS_MM,
    heightMm: VOLUMETRIC_FLASK_HEIGHT_MM,
    neckRadiusMm: VOLUMETRIC_FLASK_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.BEAKER_250ML]: Object.freeze({
    id: GlasswareIdEnum.BEAKER_250ML,
    displayName: 'Beaker (250 mL)',
    maxCapacity: BEAKER_250_MAX_CAPACITY_ML,
    graduationInterval: BEAKER_250_GRADUATION_INTERVAL_ML,
    innerRadiusMm: BEAKER_250_INNER_RADIUS_MM,
    heightMm: BEAKER_250_HEIGHT_MM,
    neckRadiusMm: BEAKER_250_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.BEAKER_100ML]: Object.freeze({
    id: GlasswareIdEnum.BEAKER_100ML,
    displayName: 'Beaker (100 mL)',
    maxCapacity: BEAKER_100_MAX_CAPACITY_ML,
    graduationInterval: BEAKER_100_GRADUATION_INTERVAL_ML,
    innerRadiusMm: BEAKER_100_INNER_RADIUS_MM,
    heightMm: BEAKER_100_HEIGHT_MM,
    neckRadiusMm: BEAKER_100_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.MEASURING_CYLINDER]: Object.freeze({
    id: GlasswareIdEnum.MEASURING_CYLINDER,
    displayName: 'Measuring Cylinder (100 mL)',
    maxCapacity: MEASURING_CYLINDER_MAX_CAPACITY_ML,
    graduationInterval: MEASURING_CYLINDER_GRADUATION_INTERVAL_ML,
    innerRadiusMm: MEASURING_CYLINDER_INNER_RADIUS_MM,
    heightMm: MEASURING_CYLINDER_HEIGHT_MM,
    neckRadiusMm: MEASURING_CYLINDER_NECK_RADIUS_MM,
    material: GlasswareMaterial.BOROSILICATE_GLASS,
  }),
  [GlasswareIdEnum.WASH_BOTTLE]: Object.freeze({
    id: GlasswareIdEnum.WASH_BOTTLE,
    displayName: 'Wash Bottle (500 mL)',
    maxCapacity: WASH_BOTTLE_MAX_CAPACITY_ML,
    graduationInterval: WASH_BOTTLE_GRADUATION_INTERVAL_ML,
    innerRadiusMm: WASH_BOTTLE_INNER_RADIUS_MM,
    heightMm: WASH_BOTTLE_HEIGHT_MM,
    neckRadiusMm: WASH_BOTTLE_NECK_RADIUS_MM,
    material: GlasswareMaterial.PLASTIC,
  }),
}) satisfies Record<GlasswareId, GlasswareSpec>;

/** Optical geometry values used for parallax-aware burette reading calculations. */
export const BURETTE_READING_POSITIONS: Readonly<BuretteReadingOpticalGeometry> = Object.freeze({
  eyeLevelOptimalAngle: BURETTE_OPTIMAL_EYE_LEVEL_ANGLE_DEGREES,
  angleToleranceDegrees: BURETTE_READING_ANGLE_TOLERANCE_DEGREES,
  maxParallaxErrorMl: BURETTE_MAX_PARALLAX_ERROR_ML,
});

/** Minimum rinse volumes needed before each glassware item is considered adequately rinsed. */
export const RINSE_VOLUME_ML: Readonly<Record<GlasswareId, Milliliters>> = Object.freeze({
  [GlasswareIdEnum.BURETTE]: BURETTE_RINSE_VOLUME_ML,
  [GlasswareIdEnum.CONICAL_FLASK]: CONICAL_FLASK_RINSE_VOLUME_ML,
  [GlasswareIdEnum.PIPETTE]: PIPETTE_RINSE_VOLUME_ML,
  [GlasswareIdEnum.VOLUMETRIC_FLASK]: VOLUMETRIC_FLASK_RINSE_VOLUME_ML,
  [GlasswareIdEnum.BEAKER_250ML]: BEAKER_250_RINSE_VOLUME_ML,
  [GlasswareIdEnum.BEAKER_100ML]: BEAKER_100_RINSE_VOLUME_ML,
  [GlasswareIdEnum.MEASURING_CYLINDER]: MEASURING_CYLINDER_RINSE_VOLUME_ML,
  [GlasswareIdEnum.WASH_BOTTLE]: WASH_BOTTLE_RINSE_VOLUME_ML,
}) satisfies Record<GlasswareId, Milliliters>;
