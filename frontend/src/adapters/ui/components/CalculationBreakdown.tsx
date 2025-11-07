import { Route, FuelCompositionData } from '../../../core/domain/Route';

interface CalculationBreakdownProps {
  route: Route;
  actualGhgIntensity?: number;
  isDark?: boolean;
}

// Helper function to calculate WtT (simplified for display)
function calculateWtT(fuelCompositions: FuelCompositionData[], electricityMJ: number): number {
  if (!fuelCompositions || fuelCompositions.length === 0) return 0;
  
  let numerator = 0;
  let totalEnergy = electricityMJ || 0;

  for (const fuel of fuelCompositions) {
    const massKg = fuel.massTonnes * 1000;
    const fuelEnergy = massKg * fuel.lcvMJPerKg;
    numerator += massKg * fuel.wtTFactor * fuel.lcvMJPerKg;
    totalEnergy += fuelEnergy;
  }

  return totalEnergy === 0 ? 0 : numerator / totalEnergy;
}

// Helper function to calculate TtW (simplified for display)
function calculateTtW(fuelCompositions: FuelCompositionData[], electricityMJ: number): number {
  if (!fuelCompositions || fuelCompositions.length === 0) return 0;
  
  let numerator = 0;
  let totalEnergy = electricityMJ || 0;

  for (const fuel of fuelCompositions) {
    const massKg = fuel.massTonnes * 1000;
    const fuelEnergy = massKg * fuel.lcvMJPerKg;
    let effectiveTtWFactor = fuel.ttWFactor;
    if (fuel.methaneSlipCoeff !== undefined && fuel.methaneSlipCoeff !== null) {
      effectiveTtWFactor = fuel.ttWFactor * (1 + fuel.methaneSlipCoeff);
    }
    numerator += massKg * effectiveTtWFactor * fuel.lcvMJPerKg;
    totalEnergy += fuelEnergy;
  }

  return totalEnergy === 0 ? 0 : numerator / totalEnergy;
}

// Helper function to calculate GHGIE_actual
function calculateActualGhgIntensity(
  fuelCompositions: FuelCompositionData[],
  electricityMJ: number,
  windFactor: number
): number {
  if (!fuelCompositions || fuelCompositions.length === 0) return 0;
  
  const wtT = calculateWtT(fuelCompositions, electricityMJ);
  const ttW = calculateTtW(fuelCompositions, electricityMJ);
  return windFactor * (wtT + ttW);
}

export default function CalculationBreakdown({ 
  route, 
  actualGhgIntensity,
  isDark = true 
}: CalculationBreakdownProps) {
  const hasFuelData = route.fuelCompositions && route.fuelCompositions.length > 0;
  
  // Calculate values if fuel composition data is available
  const wtT = hasFuelData 
    ? calculateWtT(route.fuelCompositions!, route.electricityMJ || 0)
    : null;
  const ttW = hasFuelData 
    ? calculateTtW(route.fuelCompositions!, route.electricityMJ || 0)
    : null;
  const calculatedGhgIntensity = hasFuelData
    ? calculateActualGhgIntensity(
        route.fuelCompositions!,
        route.electricityMJ || 0,
        route.windFactor || 1.0
      )
    : null;
  
  // Use provided actualGhgIntensity or calculated value
  const displayGhgIntensity = actualGhgIntensity ?? calculatedGhgIntensity ?? route.ghgIntensity;
  const windFactor = route.windFactor ?? 1.0;
  const electricityMJ = route.electricityMJ ?? 0;

  const cardClass = isDark 
    ? 'bg-black/40 backdrop-blur-md border-gray-800/50' 
    : 'bg-white border-gray-200 shadow-sm';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const headerClass = isDark
    ? 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-gray-800/50'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200';

  if (!hasFuelData) {
    return (
      <div className={`${cardClass} rounded-xl shadow-lg border p-4`}>
        <p className={`text-sm ${labelClass}`}>
          ℹ️ Calculation breakdown not available. Using stored GHG intensity value.
        </p>
      </div>
    );
  }

  return (
    <div className={`${cardClass} rounded-xl shadow-lg border overflow-hidden`}>
      <div className={`px-6 py-4 ${headerClass} border-b`}>
        <h4 className={`text-lg font-bold ${textClass} flex items-center space-x-2`}>
          <span>🧮</span>
          <span>Calculation Breakdown</span>
        </h4>
      </div>
      <div className="p-6 space-y-4">
        {/* WtT Calculation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${labelClass}`}>Well-to-Tank (WtT):</span>
            <span className={`text-sm font-semibold ${textClass}`}>
              {wtT !== null ? `${wtT.toFixed(2)} gCO₂e/MJ` : 'N/A'}
            </span>
          </div>
          <p className={`text-xs ${labelClass} italic`}>
            WtT = Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy
          </p>
        </div>

        {/* TtW Calculation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${labelClass}`}>Tank-to-Wake (TtW):</span>
            <span className={`text-sm font-semibold ${textClass}`}>
              {ttW !== null ? `${ttW.toFixed(2)} gCO₂e/MJ` : 'N/A'}
            </span>
          </div>
          <p className={`text-xs ${labelClass} italic`}>
            TtW = Σ(Mi × TtW_factor_i × LCVi) / Total Energy
            {route.fuelCompositions?.some(f => f.methaneSlipCoeff) && (
              <span className="block mt-1">(with methane slip adjustment)</span>
            )}
          </p>
        </div>

        {/* Wind Factor */}
        {windFactor !== 1.0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${labelClass}`}>Wind Factor (f_wind):</span>
              <span className={`text-sm font-semibold ${textClass}`}>
                {windFactor.toFixed(3)}
              </span>
            </div>
            <p className={`text-xs ${labelClass} italic`}>
              Wind-assisted propulsion reward factor
            </p>
          </div>
        )}

        {/* Electricity */}
        {electricityMJ > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${labelClass}`}>Electricity (Ek):</span>
              <span className={`text-sm font-semibold ${textClass}`}>
                {(electricityMJ / 1000).toFixed(2)} GJ
              </span>
            </div>
            <p className={`text-xs ${labelClass} italic`}>
              Onshore Power Supply
            </p>
          </div>
        )}

        {/* GHGIE_actual Calculation */}
        <div className="pt-4 border-t border-gray-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${labelClass}`}>GHGIE_actual:</span>
            <span className={`text-lg font-bold ${
              displayGhgIntensity <= 89.3368 ? 'text-green-500' : 'text-red-500'
            }`}>
              {displayGhgIntensity.toFixed(2)} gCO₂e/MJ
            </span>
          </div>
          <p className={`text-xs ${labelClass} italic`}>
            GHGIE_actual = f_wind × (WtT + TtW)
            {wtT !== null && ttW !== null && (
              <span className="block mt-1">
                = {windFactor.toFixed(3)} × ({wtT.toFixed(2)} + {ttW.toFixed(2)})
                = {displayGhgIntensity.toFixed(2)} gCO₂e/MJ
              </span>
            )}
          </p>
        </div>

        {/* Fuel Compositions */}
        {route.fuelCompositions && route.fuelCompositions.length > 0 && (
          <div className="pt-4 border-t border-gray-700/50 space-y-2">
            <span className={`text-sm font-medium ${labelClass}`}>Fuel Compositions:</span>
            <div className="space-y-2">
              {route.fuelCompositions.map((fuel, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  isDark ? 'bg-gray-900/50' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className={labelClass}>Fuel:</span>
                      <span className={`ml-2 font-semibold ${textClass}`}>{fuel.fuelName}</span>
                    </div>
                    <div>
                      <span className={labelClass}>Mass:</span>
                      <span className={`ml-2 ${textClass}`}>{fuel.massTonnes.toFixed(2)} t</span>
                    </div>
                    <div>
                      <span className={labelClass}>WtT Factor:</span>
                      <span className={`ml-2 ${textClass}`}>{fuel.wtTFactor.toFixed(2)} gCO₂e/MJ</span>
                    </div>
                    <div>
                      <span className={labelClass}>TtW Factor:</span>
                      <span className={`ml-2 ${textClass}`}>{fuel.ttWFactor.toFixed(2)} gCO₂e/MJ</span>
                    </div>
                    <div>
                      <span className={labelClass}>LCV:</span>
                      <span className={`ml-2 ${textClass}`}>{fuel.lcvMJPerKg.toFixed(2)} MJ/kg</span>
                    </div>
                    {fuel.methaneSlipCoeff !== undefined && fuel.methaneSlipCoeff !== null && (
                      <div>
                        <span className={labelClass}>Methane Slip:</span>
                        <span className={`ml-2 ${textClass}`}>
                          {(fuel.methaneSlipCoeff * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

