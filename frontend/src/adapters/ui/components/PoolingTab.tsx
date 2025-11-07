import { useEffect, useState } from 'react';
import { ComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { Pool } from '../../../core/domain/Pool';
import { ApiComplianceService } from '../../../adapters/infrastructure/ApiComplianceService';
import { ApiPoolingService } from '../../../adapters/infrastructure/ApiPoolingService';

const complianceService = new ApiComplianceService();
const poolingService = new ApiPoolingService();

const AVAILABLE_SHIPS = ['R001', 'R002', 'R003', 'R004', 'R005'];

interface PoolingTabProps {
  isDark?: boolean;
}

export default function PoolingTab({ isDark = true }: PoolingTabProps) {
  const [year, setYear] = useState(2024);
  const [selectedShips, setSelectedShips] = useState<string[]>([]);
  const [adjustedCbs, setAdjustedCbs] = useState<Map<string, ComplianceBalance>>(
    new Map()
  );
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAdjustedCbs = async () => {
    if (selectedShips.length === 0) {
      setAdjustedCbs(new Map());
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cbs = await Promise.all(
        selectedShips.map((shipId) =>
          complianceService.getAdjustedComplianceBalance(shipId, year)
        )
      );
      const map = new Map<string, ComplianceBalance>();
      cbs.forEach((cb) => map.set(cb.shipId, cb));
      setAdjustedCbs(map);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustedCbs();
  }, [selectedShips, year]);

  const toggleShip = (shipId: string) => {
    if (selectedShips.includes(shipId)) {
      setSelectedShips(selectedShips.filter((id) => id !== shipId));
    } else {
      setSelectedShips([...selectedShips, shipId]);
    }
  };

  // cbGco2eq is returned from the backend in g CO2e (grams). Convert to tonnes for display.
  const totalCb = Array.from(adjustedCbs.values()).reduce(
    (sum, cb) => sum + cb.cbGco2eq / 1_000_000,
    0
  );

  const isValid = totalCb >= 0;

  const handleCreatePool = async () => {
    try {
      setLoading(true);
      setError(null);
      const newPool = await poolingService.createPool(year, selectedShips);
      setPool(newPool);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cardClass = isDark 
    ? 'bg-black/40 backdrop-blur-md border-gray-800/50' 
    : 'bg-white border-gray-200 shadow-sm';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-black/60 border-gray-700 text-white'
    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <div className="space-y-6">
      {/* AI Agent Workflow Indicator */}
      <div className={`${cardClass} rounded-xl p-4 border shadow-lg`}>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-lg">🤖</span>
          <span className={labelClass}>
            <strong>AI Agent Active:</strong> Intelligent pool optimization using greedy allocation algorithm
          </span>
        </div>
      </div>

      <div className={`${cardClass} shadow-lg sm:rounded-md p-6 border`}>
        <h3 className={`text-lg font-medium mb-4 ${textClass} flex items-center space-x-2`}>
          <span>🤝</span>
          <span>Create Pool</span>
        </h3>
        <div className="mb-4">
          <label className={`block text-sm font-medium ${labelClass} mb-1`}>
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className={`w-full md:w-48 px-3 py-2 border rounded-md ${inputClass}`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium ${labelClass} mb-2`}>
            Select Ships
          </label>
          <div className="space-y-2">
            {AVAILABLE_SHIPS.map((shipId) => (
              <label key={shipId} className={`flex items-center ${textClass} cursor-pointer hover:opacity-80 transition-opacity`}>
                <input
                  type="checkbox"
                  checked={selectedShips.includes(shipId)}
                  onChange={() => toggleShip(shipId)}
                  className="mr-2 w-4 h-4"
                />
                <span className="font-medium">{shipId}</span>
                {adjustedCbs.has(shipId) && (
                  <span className={`ml-2 text-sm ${labelClass}`}>
                    (CB: {(adjustedCbs.get(shipId)!.cbGco2eq / 1_000_000).toFixed(2)} t CO₂eq)
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className={`mb-4 p-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-md border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={`text-sm font-medium ${labelClass}`}>Pool Sum</p>
          <p
            className={`text-2xl font-semibold ${
              isValid ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {totalCb.toFixed(2)} t CO₂eq
          </p>
          {!isValid && (
            <p className="text-sm text-red-400 mt-1">
              Pool invalid: Sum must be ≥ 0
            </p>
          )}
        </div>

        <button
          onClick={handleCreatePool}
          disabled={!isValid || selectedShips.length === 0 || loading}
          className={`px-4 py-2 rounded-md transition-colors ${
            !isValid || selectedShips.length === 0 || loading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Create Pool
        </button>
      </div>

      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} rounded-md border backdrop-blur-sm`}>
          {error}
        </div>
      )}

      {pool && (
        <div className={`${cardClass} shadow-lg sm:rounded-md p-6 border`}>
          <h3 className={`text-lg font-medium mb-4 ${textClass}`}>Pool Created</h3>
          <p className={`text-sm ${labelClass} mb-4`}>
            Pool ID: <strong className={textClass}>{pool.id}</strong> | Year: <strong className={textClass}>{pool.year}</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className={isDark ? 'bg-gray-900/60' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    Ship ID
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    CB Before
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    CB After
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? 'bg-black/20 divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}>
                {pool.members.map((member) => (
                  <tr key={member.id} className={isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textClass}`}>
                      {member.shipId}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                      {(member.cbBefore / 1_000_000).toFixed(2)} t CO₂eq
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                      {(member.cbAfter / 1_000_000).toFixed(2)} t CO₂eq
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          member.cbAfter - member.cbBefore >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {(member.cbAfter - member.cbBefore >= 0 ? '+' : '') +
                          ((member.cbAfter - member.cbBefore) / 1_000_000).toFixed(2)}{' '}
                        t CO₂eq
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

