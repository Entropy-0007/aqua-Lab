/**
 * Defines real-world chemistry reference constants used by the EDTA titration simulator.
 */

import type {
  Chemical,
  ChemicalId,
  ChemicalReaction,
  IndicatorBehavior,
  MilligramsPerMole,
} from '../types/chemical.types';
import { ChemicalId as ChemicalIdEnum } from '../types/chemical.types';
import type { MilligramsPerLiter, Moles, MolesPerLiter } from '../types/units.types';

/** IUPAC molar mass reference for disodium EDTA (C10H14N2Na2O8.2H2O), represented numerically in g/mol. */
const EDTA_DISODIUM_MOLAR_MASS = 372.24 as MilligramsPerMole;
/** Typical standardized laboratory EDTA titrant concentration for hardness titration. */
const EDTA_STANDARD_CONCENTRATION = 0.01 as MolesPerLiter;
/** Visual appearance of EDTA solution in aqueous lab conditions (nearly clear). */
const EDTA_SOLUTION_COLOR_HEX = '#FAFAFA';

/** Literature molar mass reference for Eriochrome Black T indicator, represented numerically in g/mol. */
const ERIOCHROME_BLACK_T_MOLAR_MASS = 461.38 as MilligramsPerMole;
/** Typical concentrated indicator stock appearance in aqueous-alcoholic medium (dark blue-black). */
const ERIOCHROME_BLACK_T_COLOR_HEX = '#1A0A2E';
/** Wine-red complex color for metal-bound Eriochrome Black T near pre-endpoint conditions. */
const ERIOCHROME_BELOW_ENDPOINT_COLOR_HEX = '#C0392B';
/** Free-indicator endpoint color observed near complete metal complexation. */
const ERIOCHROME_AT_ENDPOINT_COLOR_HEX = '#1B6CA8';
/** Practical indicator transition pH lower bound when ammonia buffer targets pH 10. */
const ERIOCHROME_TRANSITION_PH_MIN = 9.8;
/** Practical indicator transition pH upper bound when ammonia buffer targets pH 10. */
const ERIOCHROME_TRANSITION_PH_MAX = 10.2;
/** Metal-ion concentration threshold for a visibly sharp EBT color transition in teaching labs. */
const ERIOCHROME_TRANSITION_METAL_THRESHOLD = 0.00003 as MolesPerLiter;

/** Reference molar mass for anhydrous calcium chloride (CaCl2), represented numerically in g/mol. */
const CALCIUM_CHLORIDE_MOLAR_MASS = 110.98 as MilligramsPerMole;
/** Reference molar mass for anhydrous magnesium sulfate (MgSO4), represented numerically in g/mol. */
const MAGNESIUM_SULFATE_MOLAR_MASS = 120.37 as MilligramsPerMole;
/** Reference molar mass for ammonia (NH3), represented numerically in g/mol. */
const AMMONIA_MOLAR_MASS = 17.03 as MilligramsPerMole;
/** Placeholder matrix molar-mass value for water-only domain entries in the current chemical schema. */
const WATER_MATRIX_PLACEHOLDER_MOLAR_MASS = 0 as MilligramsPerMole;

/** Pure-water dissolved metal concentration reference for mineral-free distilled water. */
const ZERO_DISSOLVED_METAL_CONCENTRATION = 0 as MolesPerLiter;

/** Stoichiometric coefficient for 1:1 EDTA-metal complex formation. */
const STOICHIOMETRIC_ONE_MOLE = 1 as Moles;

/** USGS-aligned lower bound for soft water hardness as CaCO3 equivalent. */
const HARDNESS_SOFT_MIN = 0 as MilligramsPerLiter;
/** USGS-aligned upper bound for soft water hardness as CaCO3 equivalent. */
const HARDNESS_SOFT_MAX = 75 as MilligramsPerLiter;
/** USGS-aligned lower bound for moderately hard water hardness as CaCO3 equivalent. */
const HARDNESS_MODERATELY_HARD_MIN = 75 as MilligramsPerLiter;
/** USGS-aligned upper bound for moderately hard water hardness as CaCO3 equivalent. */
const HARDNESS_MODERATELY_HARD_MAX = 150 as MilligramsPerLiter;
/** USGS-aligned lower bound for hard water hardness as CaCO3 equivalent. */
const HARDNESS_HARD_MIN = 150 as MilligramsPerLiter;
/** USGS-aligned upper bound for hard water hardness as CaCO3 equivalent. */
const HARDNESS_HARD_MAX = 300 as MilligramsPerLiter;
/** USGS-aligned lower bound for very hard water hardness as CaCO3 equivalent. */
const HARDNESS_VERY_HARD_MIN = 300 as MilligramsPerLiter;

/** Conditions keyword for ammonia-buffered EDTA titration at target pH 10. */
const EDTA_TITRATION_TARGET_PH = 10;
/** Human-readable reaction descriptor for instructional context. */
const EDTA_TITRATION_REACTION_CLASS = 'Complexometric titration';
/** Human-readable stoichiometry descriptor for instructional context. */
const EDTA_TITRATION_STOICHIOMETRY = '1:1 EDTA:metal-ion complexation';
/** Buffer system descriptor used in standard hardness experiments. */
const EDTA_TITRATION_BUFFER_SYSTEM = 'Ammonia/Ammonium chloride buffer';
/** Indicator descriptor for endpoint visualization. */
const EDTA_TITRATION_INDICATOR = 'Eriochrome Black T';
/** Endpoint visual change descriptor for student detection training. */
const EDTA_TITRATION_VISUAL_TRANSITION = 'Wine red to pure blue (sharp transition)';

/** Represents hardness classification bands in mg/L as CaCO3 equivalent. */
interface HardnessRange {
  readonly min: MilligramsPerLiter;
  readonly max: MilligramsPerLiter | null;
}

/** Represents available water-hardness classes used in lab reports. */
type HardnessClass = 'SOFT' | 'MODERATELY_HARD' | 'HARD' | 'VERY_HARD';

/** Indicator behavior profile for Eriochrome Black T around endpoint conditions. */
const ERIOCHROME_BLACK_T_BEHAVIOR: Readonly<IndicatorBehavior> = Object.freeze({
  colorBelowEndpoint: ERIOCHROME_BELOW_ENDPOINT_COLOR_HEX,
  colorAtEndpoint: ERIOCHROME_AT_ENDPOINT_COLOR_HEX,
  transitionpH: Object.freeze({
    min: ERIOCHROME_TRANSITION_PH_MIN,
    max: ERIOCHROME_TRANSITION_PH_MAX,
  }),
  transitionMetalConcentrationThreshold: ERIOCHROME_TRANSITION_METAL_THRESHOLD,
});

/** Complete chemical registry used by the simulator for EDTA hardness titration workflows. */
export const CHEMICALS: Readonly<Record<ChemicalId, Chemical>> = Object.freeze({
  [ChemicalIdEnum.EDTA_DISODIUM]: Object.freeze({
    id: ChemicalIdEnum.EDTA_DISODIUM,
    name: 'Disodium EDTA',
    formula: 'C10H14N2Na2O8.2H2O',
    molarMass: EDTA_DISODIUM_MOLAR_MASS,
    colorHex: EDTA_SOLUTION_COLOR_HEX,
    concentration: EDTA_STANDARD_CONCENTRATION,
    isIndicator: false,
    indicatorBehavior: null,
  }),
  [ChemicalIdEnum.ERIOCHROME_BLACK_T]: Object.freeze({
    id: ChemicalIdEnum.ERIOCHROME_BLACK_T,
    name: 'Eriochrome Black T',
    formula: 'C20H12N3O7SNa',
    molarMass: ERIOCHROME_BLACK_T_MOLAR_MASS,
    colorHex: ERIOCHROME_BLACK_T_COLOR_HEX,
    concentration: null,
    isIndicator: true,
    indicatorBehavior: ERIOCHROME_BLACK_T_BEHAVIOR,
  }),
  [ChemicalIdEnum.CALCIUM_CHLORIDE]: Object.freeze({
    id: ChemicalIdEnum.CALCIUM_CHLORIDE,
    name: 'Calcium Chloride',
    formula: 'CaCl2',
    molarMass: CALCIUM_CHLORIDE_MOLAR_MASS,
    colorHex: '#F8F9FA',
    concentration: null,
    isIndicator: false,
    indicatorBehavior: null,
  }),
  [ChemicalIdEnum.MAGNESIUM_SULFATE]: Object.freeze({
    id: ChemicalIdEnum.MAGNESIUM_SULFATE,
    name: 'Magnesium Sulfate',
    formula: 'MgSO4',
    molarMass: MAGNESIUM_SULFATE_MOLAR_MASS,
    colorHex: '#F8F9FA',
    concentration: null,
    isIndicator: false,
    indicatorBehavior: null,
  }),
  [ChemicalIdEnum.AMMONIA_BUFFER]: Object.freeze({
    id: ChemicalIdEnum.AMMONIA_BUFFER,
    name: 'Ammonia Buffer (pH 10.0 target)',
    formula: 'NH3/NH4Cl',
    molarMass: AMMONIA_MOLAR_MASS,
    colorHex: '#F5F7FA',
    concentration: null,
    isIndicator: false,
    indicatorBehavior: null,
  }),
  [ChemicalIdEnum.SAMPLE_WATER]: Object.freeze({
    id: ChemicalIdEnum.SAMPLE_WATER,
    name: 'Sample Water (Ca2+ and Mg2+ dissolved ions)',
    formula: 'H2O + Ca2+/Mg2+',
    molarMass: WATER_MATRIX_PLACEHOLDER_MOLAR_MASS,
    colorHex: '#EAF6FF',
    concentration: null,
    isIndicator: false,
    indicatorBehavior: null,
  }),
  [ChemicalIdEnum.DISTILLED_WATER]: Object.freeze({
    id: ChemicalIdEnum.DISTILLED_WATER,
    name: 'Distilled Water',
    formula: 'H2O',
    molarMass: WATER_MATRIX_PLACEHOLDER_MOLAR_MASS,
    colorHex: '#FDFEFE',
    concentration: ZERO_DISSOLVED_METAL_CONCENTRATION,
    isIndicator: false,
    indicatorBehavior: null,
  }),
}) satisfies Record<ChemicalId, Chemical>;

/** Water-hardness classification ranges expressed as mg/L CaCO3 equivalent. */
export const STANDARD_HARDNESS_VALUES: Readonly<Record<HardnessClass, HardnessRange>> = Object.freeze({
  SOFT: Object.freeze({
    min: HARDNESS_SOFT_MIN,
    max: HARDNESS_SOFT_MAX,
  }),
  MODERATELY_HARD: Object.freeze({
    min: HARDNESS_MODERATELY_HARD_MIN,
    max: HARDNESS_MODERATELY_HARD_MAX,
  }),
  HARD: Object.freeze({
    min: HARDNESS_HARD_MIN,
    max: HARDNESS_HARD_MAX,
  }),
  VERY_HARD: Object.freeze({
    min: HARDNESS_VERY_HARD_MIN,
    max: null,
  }),
});

/** Reactant map for canonical 1:1 EDTA-metal complex formation in hardness titration. */
const EDTA_TITRATION_REACTANTS = new Map<ChemicalId, Moles>([
  [ChemicalIdEnum.EDTA_DISODIUM, STOICHIOMETRIC_ONE_MOLE],
  [ChemicalIdEnum.SAMPLE_WATER, STOICHIOMETRIC_ONE_MOLE],
]);

/** Product map representing chelated sample matrix after EDTA binding. */
const EDTA_TITRATION_PRODUCTS = new Map<ChemicalId, Moles>([
  [ChemicalIdEnum.SAMPLE_WATER, STOICHIOMETRIC_ONE_MOLE],
]);

/** Environmental and methodological constraints for accurate endpoint detection at pH 10. */
const EDTA_TITRATION_CONDITIONS = Object.freeze({
  reactionClass: EDTA_TITRATION_REACTION_CLASS,
  stoichiometry: EDTA_TITRATION_STOICHIOMETRY,
  targetPH: EDTA_TITRATION_TARGET_PH,
  bufferSystem: EDTA_TITRATION_BUFFER_SYSTEM,
  indicator: EDTA_TITRATION_INDICATOR,
  visualTransition: EDTA_TITRATION_VISUAL_TRANSITION,
});

/** Canonical EDTA complexometric reaction definition used for simulation metadata. */
export const EDTA_TITRATION_REACTION: Readonly<ChemicalReaction> = Object.freeze({
  id: 'edta-metal-complex-formation',
  reactants: Object.freeze(EDTA_TITRATION_REACTANTS),
  products: Object.freeze(EDTA_TITRATION_PRODUCTS),
  conditions: EDTA_TITRATION_CONDITIONS,
  isReversible: false,
});
