import { useEffect, useState } from 'react';
import { ComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { BankEntry } from '../../../core/domain/BankEntry';
import { ApiComplianceService } from '../../../adapters/infrastructure/ApiComplianceService';
import { ApiBankingService } from '../../../adapters/infrastructure/ApiBankingService';
import LoadingSpinner from './LoadingSpinner';

const complianceService = new ApiComplianceService();
const bankingService = new ApiBankingService();

interface BankingTabProps {
  isDark?: boolean;
}

export default function BankingTab({ isDark = true }: BankingTabProps) {
  const [shipId, setShipId] = useState('R001');
  const [year, setYear] = useState(2024);
  const [cb, setCb] = useState<ComplianceBalance | null>(null);
  const [cbAfter, setCbAfter] = useState<number | null>(null);
  const [applied, setApplied] = useState<number | null>(null);
  const [bankRecords, setBankRecords] = useState<BankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applyAmount, setApplyAmount] = useState('');

  useEffect(() => {
    loadData();
  }, [shipId, year]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cbData, records] = await Promise.all([
        complianceService.getComplianceBalance(shipId, year),
        bankingService.getBankRecords(shipId, year),
      ]);
      setCb(cbData);
      setBankRecords(records);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async () => {
    try {
      setLoading(true);
      setError(null);
      await bankingService.bankSurplus(shipId, year);
      await loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);
      setError(null);
      // amount entered by user is in tonnes — convert to grams for backend
      const amountTonnes = parseFloat(applyAmount);
      if (isNaN(amountTonnes) || amountTonnes <= 0) {
        throw new Error('Invalid amount');
      }
      const amountG = Math.round(amountTonnes * 1_000_000);
      const result = await bankingService.applyBanked(shipId, year, amountG);
      setApplied(result.applied);
      setCbAfter(result.cbAfter);
      setApplyAmount('');
      await loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // bank records are stored in g CO2e; compute both g and tonnes for display and checks
  const totalBankedG = bankRecords.reduce((sum, r) => sum + r.amountGco2eq, 0);
  const totalBanked = totalBankedG / 1_000_000;

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
      {/* AI Agent Workflow Indicator */}
      <div className={`${cardClass} rounded-xl p-4 border shadow-lg`}>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-lg">🤖</span>
          <span className={labelClass}>
            <strong>AI Agent Active:</strong> Real-time compliance calculations powered by intelligent algorithms
          </span>
        </div>
      </div>

      <div className={`${cardClass} shadow-lg sm:rounded-md p-6 border`}>
        <h3 className={`text-lg font-medium mb-4 ${textClass} flex items-center space-x-2`}>
          <span>💰</span>
          <span>Banking Controls</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={`block text-sm font-medium ${labelClass} mb-1`}>
              Ship ID
            </label>
            <input
              type="text"
              value={shipId}
              onChange={(e) => setShipId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${inputClass}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${labelClass} mb-1`}>
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md ${inputClass}`}
            />
          </div>
        </div>
        <button
          onClick={loadData}
          className={`px-4 py-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors`}
        >
          Load Data
        </button>
      </div>

      {error && (
        <div className={`p-4 ${isDark ? 'bg-red-900/30 border-red-700/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} rounded-md border backdrop-blur-sm`}>
          {error}
        </div>
      )}

      {loading && <LoadingSpinner />}

      {cb && (
        <div className={`${cardClass} shadow-lg sm:rounded-md p-6 border`}>
          <h3 className={`text-lg font-medium mb-4 ${textClass}`}>Compliance Balance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${labelClass}`}>CB Before</p>
              <p className={`text-2xl font-semibold ${textClass} ${cb.cbGco2eq < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(cb.cbGco2eq / 1_000_000).toFixed(2)} t CO₂eq
              </p>
            </div>
            {applied !== null && (
              <>
                <div>
                  <p className={`text-sm ${labelClass}`}>Applied</p>
                  <p className={`text-2xl font-semibold ${textClass}`}>
                    {(applied / 1_000_000).toFixed(2)} t CO₂eq
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${labelClass}`}>CB After</p>
                  <p className={`text-2xl font-semibold ${textClass} ${cbAfter !== null && cbAfter < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {cbAfter !== null ? `${(cbAfter / 1_000_000).toFixed(2)} t CO₂eq` : '-'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <button
                onClick={handleBank}
                disabled={cb.cbGco2eq <= 0 || loading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  cb.cbGco2eq <= 0 || loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Bank Surplus
              </button>
            </div>

            <div className="flex gap-4">
              <input
                type="number"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                placeholder="Amount to apply"
                className={`px-3 py-2 border rounded-md ${inputClass}`}
              />
              <button
                onClick={handleApply}
                disabled={!applyAmount || totalBanked <= 0 || loading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !applyAmount || totalBanked <= 0 || loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Apply Banked
              </button>
            </div>
          </div>
        </div>
      )}

      {bankRecords.length > 0 && (
        <div className={`${cardClass} shadow-lg sm:rounded-md p-6 border`}>
          <h3 className={`text-lg font-medium mb-4 ${textClass}`}>Bank Records</h3>
          <p className={`text-sm ${labelClass} mb-4`}>
            Total Banked: <strong className={textClass}>{totalBanked.toFixed(2)} t CO₂eq</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className={isDark ? 'bg-gray-900/60' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${labelClass} uppercase tracking-wider`}>
                    Amount (t CO₂eq)
                  </th>
                </tr>
              </thead>
              <tbody className={isDark ? 'bg-black/20 divide-y divide-gray-800' : 'bg-white divide-y divide-gray-200'}>
                {bankRecords.map((record) => (
                  <tr key={record.id} className={isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${labelClass}`}>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${textClass}`}>
                      {(record.amountGco2eq / 1_000_000).toFixed(2)}
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

