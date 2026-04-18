<!-- /**
  * Documents EDTA titration chemistry references used by Aqua Lab.
  */ -->
# EDTA Titration Chemistry Reference

## Scope
This reference covers complexometric EDTA titration for hardness analysis, including stoichiometry, endpoint behavior, expected titrant volume calculations, and practical error sources.

## Reaction Equations
1. General metal complexation:
   M^(n+) + Y^(4-) -> [MY]^(n-4)
2. Calcium complexation:
   Ca^(2+) + Y^(4-) -> [CaY]^(2-)
3. Magnesium complexation:
   Mg^(2+) + Y^(4-) -> [MgY]^(2-)
4. Indicator-metal complex (pre-endpoint conceptual):
   M-Ind + Y^(4-) -> [MY]^(n-4) + Ind

## Endpoint Conditions
1. Buffered pH near 10.0 is required for stable complex formation and indicator response.
2. Endpoint occurs when free indicator dominates over metal-indicator complex.
3. Observable transition with Eriochrome Black T: wine red (metal-bound) to clear blue (free indicator).
4. Endpoint reliability improves with consistent mixing and controlled titrant addition near completion.

## Expected Titrant Volumes
1. Stoichiometric basis is approximately 1:1 molar equivalence between EDTA and divalent metal ions.
2. Volume relationship:
   V_EDTA = (C_metal,total x V_sample) / C_EDTA
3. Example A:
   Sample volume = 50.00 mL, total metal concentration = 2.00 mmol/L, EDTA = 0.0100 mol/L.
   Expected V_EDTA = (0.00200 mol/L x 0.05000 L) / 0.0100 mol/L = 0.0100 L = 10.00 mL.
4. Example B:
   Sample volume = 25.00 mL, total metal concentration = 4.00 mmol/L, EDTA = 0.0100 mol/L.
   Expected V_EDTA = (0.00400 mol/L x 0.02500 L) / 0.0100 mol/L = 0.0100 L = 10.00 mL.

## Error Sources
1. pH drift from target buffer range alters complexation and endpoint sharpness.
2. Indicator overdosing or aged indicator stock weakens color transition fidelity.
3. Dissolved interfering metal ions create additional EDTA demand.
4. Incomplete mixing near endpoint causes delayed or unstable color change.
5. Glassware calibration error biases delivered titrant and sampled analyte volume.
6. Temperature shifts can subtly influence equilibrium and indicator intensity.

## Eriochrome Black T Indicator Behavior
1. In buffered solution with Mg/Ca present, indicator forms a wine-red metal-indicator complex.
2. During titration, EDTA preferentially complexes free and weakly bound metal ions.
3. Near equivalence, EDTA strips metal from indicator complex.
4. Free indicator state appears blue, signaling endpoint achievement.
5. In very low hardness samples, a magnesium-EDTA spike is often used in practice to sharpen endpoint response.
