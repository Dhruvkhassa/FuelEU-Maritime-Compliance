import { useEffect, useState } from 'react';
import { Route } from '../../../core/domain/Route';
import { ApiRouteService } from '../../../adapters/infrastructure/ApiRouteService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import CalculationBreakdown from './CalculationBreakdown';

const routeService = new ApiRouteService();
const TARGET_INTENSITY = 89.3368;

interface CompareTabProps {
  isDark?: boolean;
}

export default function CompareTab({ isDark = true }: CompareTabProps) {
  const [comparison, setComparison] = useState<{
    baseline: Route;
    comparisons: Array<{
      route: Route;
      percentDiff: number;
      compliant: boolean;
      actualGhgIntensity: number;
    }>;
  } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const data = await routeService.getComparison();
      setComparison(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparison
    ? [
        {
          name: 'Baseline',
          'GHG Intensity': comparison.baseline.ghgIntensity,
          'Actual GHG Intensity': comparison.baseline.ghgIntensity,
          'Target': TARGET_INTENSITY,
        },
        ...comparison.comparisons.map((c) => ({
          name: c.route.routeId,
          'GHG Intensity': c.route.ghgIntensity,
          'Actual GHG Intensity': c.actualGhgIntensity,
          'Target': TARGET_INTENSITY,
        })),
      ]
    : [];

  const getBarColor = (value: number) => {
    return value <= TARGET_INTENSITY ? '#10b981' : '#ef4444';
  };

  const getActualBarColor = (value: number) => {
    return value <= TARGET_INTENSITY ? '#34d399' : '#f87171';
  };

  const cardClass = isDark 
    ? 'bg-black/40 backdrop-blur-md border-gray-800/50' 
    : 'bg-white border-gray-200 shadow-sm';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const headerClass = isDark
    ? 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-gray-800/50'
    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-200';

  return (
    <div className="space-y-6">
      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} rounded-lg shadow-sm flex items-center space-x-2 border`}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : comparison ? (
        <div className="space-y-6">
          <div className={`${cardClass} rounded-xl shadow-lg border overflow-hidden`}>
            <div className={`px-6 py-5 ${headerClass} border-b`}>
              <h3 className={`text-xl font-bold ${textClass} flex items-center space-x-2`}>
                <span>📊</span>
                <span>Baseline vs Comparison Routes</span>
              </h3>
            </div>
            <div className="px-6 py-5">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                <thead className={isDark ? 'bg-gray-900/60' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      Route ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      Stored GHG Intensity
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      Actual GHG Intensity
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      % Difference
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      Compliant
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'bg-black/20 divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}>
                  <tr className={isDark ? 'hover:bg-gray-900/50' : 'hover:bg-blue-50/50'} style={{ transition: 'background-color 0.15s' }}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClass}`}>
                      {comparison.baseline.routeId} (Baseline)
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                      {comparison.baseline.ghgIntensity.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      comparison.baseline.ghgIntensity <= TARGET_INTENSITY ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {comparison.baseline.ghgIntensity.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                      0.00%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {comparison.baseline.ghgIntensity <= TARGET_INTENSITY ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          isDark 
                            ? 'bg-green-900/50 text-green-300 border-green-700/50'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }`}>✅ Compliant</span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          isDark 
                            ? 'bg-red-900/50 text-red-300 border-red-700/50'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>❌ Non-Compliant</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRoute(selectedRoute?.id === comparison.baseline.id ? null : comparison.baseline)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          isDark
                            ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 border border-blue-700/50'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                        }`}
                      >
                        {selectedRoute?.id === comparison.baseline.id ? 'Hide' : 'Show'} Details
                      </button>
                    </td>
                  </tr>
                  {selectedRoute?.id === comparison.baseline.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4">
                        <CalculationBreakdown 
                          route={comparison.baseline} 
                          isDark={isDark}
                        />
                      </td>
                    </tr>
                  )}
                  {comparison.comparisons.map((comp) => (
                    <>
                      <tr key={comp.route.id} className={isDark ? 'hover:bg-gray-900/50' : 'hover:bg-blue-50/50'} style={{ transition: 'background-color 0.15s' }}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClass}`}>
                          {comp.route.routeId}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                          {comp.route.ghgIntensity.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          comp.actualGhgIntensity <= TARGET_INTENSITY ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {comp.actualGhgIntensity.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                          {comp.percentDiff.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {comp.compliant ? (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              isDark 
                                ? 'bg-green-900/50 text-green-300 border-green-700/50'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }`}>✅ Compliant</span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              isDark 
                                ? 'bg-red-900/50 text-red-300 border-red-700/50'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>❌ Non-Compliant</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedRoute(selectedRoute?.id === comp.route.id ? null : comp.route)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              isDark
                                ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 border border-blue-700/50'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                            }`}
                          >
                            {selectedRoute?.id === comp.route.id ? 'Hide' : 'Show'} Details
                          </button>
                        </td>
                      </tr>
                      {selectedRoute?.id === comp.route.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4">
                            <CalculationBreakdown 
                              route={comp.route} 
                              actualGhgIntensity={comp.actualGhgIntensity}
                              isDark={isDark}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardClass} rounded-xl shadow-lg border p-6`}>
            <h3 className={`text-xl font-bold ${textClass} mb-6 flex items-center space-x-2`}>
              <span>📈</span>
              <span>GHG Intensity Comparison Chart</span>
            </h3>
            <div className={`${isDark ? 'bg-black/60' : 'bg-white'} rounded-lg p-4 border ${isDark ? 'border-gray-800/50' : 'border-gray-200'}`}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    label={{ value: 'gCO₂e/MJ', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                      color: '#f3f4f6'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="GHG Intensity" name="Stored GHG Intensity" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry['GHG Intensity'])} />
                    ))}
                  </Bar>
                  <Bar dataKey="Actual GHG Intensity" name="Actual GHG Intensity (Calculated)" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`actual-cell-${index}`} fill={getActualBarColor(entry['Actual GHG Intensity'])} />
                    ))}
                  </Bar>
                  <Bar dataKey="Target" name="Target (89.34)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

