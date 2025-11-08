import React, { useEffect, useState } from 'react';
import { Route } from '../../../core/domain/Route';
import { ApiRouteService } from '../../../adapters/infrastructure/ApiRouteService';
import LoadingSpinner from './LoadingSpinner';
import CalculationBreakdown from './CalculationBreakdown';

const routeService = new ApiRouteService();

interface RoutesTabProps {
  isDark?: boolean;
}

export default function RoutesTab({ isDark = true }: RoutesTabProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [filters, setFilters] = useState<{
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }>({});

  useEffect(() => {
    loadRoutes();
  }, [filters]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await routeService.getAllRoutes(filters);
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeService.setBaseline(routeId);
      await loadRoutes();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const uniqueVesselTypes = Array.from(new Set(routes.map((r) => r.vesselType)));
  const uniqueFuelTypes = Array.from(new Set(routes.map((r) => r.fuelType)));
  const uniqueYears = Array.from(new Set(routes.map((r) => r.year))).sort();

  const cardClass = isDark 
    ? 'bg-black/40 backdrop-blur-md border-gray-800/50' 
    : 'bg-white border-gray-200 shadow-sm';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-black/60 border-gray-700 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      <div className={`${cardClass} rounded-xl shadow-lg p-6 border`}>
        <h2 className={`text-2xl font-bold ${textClass} mb-4 flex items-center space-x-2`}>
          <span>🚢</span>
          <span>Routes Management</span>
        </h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={filters.vesselType || ''}
            onChange={(e) =>
              setFilters({ ...filters, vesselType: e.target.value || undefined })
            }
            className={`px-4 py-2 border rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value={isDark ? "" : ""} className={isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>All Vessel Types</option>
            {uniqueVesselTypes.map((type) => (
              <option key={type} value={type} className={isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.fuelType || ''}
            onChange={(e) =>
              setFilters({ ...filters, fuelType: e.target.value || undefined })
            }
            className={`px-4 py-2 border rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value={isDark ? "" : ""} className={isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>All Fuel Types</option>
            {uniqueFuelTypes.map((type) => (
              <option key={type} value={type} className={isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={filters.year || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                year: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className={`px-4 py-2 border rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
          >
            <option value={isDark ? "" : ""} className={isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className={`mb-4 p-4 ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} rounded-lg shadow-sm flex items-center space-x-2 border`}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={`${cardClass} rounded-xl shadow-lg overflow-hidden border`}>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Route ID
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Vessel Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Fuel Type
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Year
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    <div>GHG Intensity</div>
                    <div className="text-[10px] mt-1">gCO₂e/MJ</div>
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Fuel (t)
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Distance (km)
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Emissions (t)
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Actions
                  </th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold ${labelClass} uppercase tracking-wider`}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? 'bg-black/20 divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}>
                {routes.map((route) => (
                  <React.Fragment key={route.id}>
                    <tr 
                      className={isDark ? 'hover:bg-gray-900/50' : 'hover:bg-blue-50/50'} 
                      style={{ transition: 'background-color 0.15s' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${textClass}`}>{route.routeId}</span>
                          {route.isBaseline && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              isDark 
                                ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              Baseline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        {route.vesselType}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        <span className={`px-2 py-1 rounded-md ${
                          isDark 
                            ? 'bg-gray-800/50 border border-gray-700/50'
                            : 'bg-gray-100 border border-gray-200'
                        }`}>{route.fuelType}</span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        {route.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          route.ghgIntensity > 89.3368 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {route.ghgIntensity.toFixed(2)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        {route.fuelConsumption.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        {route.distance.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                        {route.totalEmissions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleSetBaseline(route.routeId)}
                          disabled={route.isBaseline}
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            route.isBaseline
                              ? isDark
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
                              : isDark
                                ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg border border-gray-700 hover:border-gray-600'
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                          }`}
                        >
                          {route.isBaseline ? 'Baseline' : 'Set Baseline'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedRoute(selectedRoute?.id === route.id ? null : route)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 border border-blue-700/50'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200'
                          }`}
                        >
                          {selectedRoute?.id === route.id ? 'Hide' : 'Show'} Details
                        </button>
                      </td>
                    </tr>
                    {selectedRoute?.id === route.id && (
                      <tr key={`${route.id}-details`}>
                        <td colSpan={10} className="px-6 py-4">
                          <CalculationBreakdown 
                            route={route} 
                            isDark={isDark}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

