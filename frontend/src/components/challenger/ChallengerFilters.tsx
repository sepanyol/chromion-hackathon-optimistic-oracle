// components/ChallengerFilters.tsx
'use client';
import React, { useState } from 'react';
import { Filter, Clock } from 'lucide-react';

interface ChallengerFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const ChallengerFilters: React.FC<ChallengerFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    riskScoreRange: { min: 7.0, max: 10.0 },
    timeRemaining: 'all',
    chain: 'all',
    minValue: '0.2',
    confidence: 'all'
  });

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '1h', label: '< 1 hour' },
    { value: '6h', label: '< 6 hours' },
    { value: '24h', label: '< 24 hours' },
    { value: '7d', label: '< 7 days' }
  ];

  const chains = [
    { value: 'all', label: 'All Chains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'avalanche', label: 'Avalanche' }
  ];

  const confidenceLevels = [
    { value: 'all', label: 'All Confidence' },
    { value: 'low', label: 'Low', color: 'bg-red-100 text-red-800' },
    { value: 'med', label: 'Med', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-green-100 text-green-800' }
  ];

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateRiskRange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...filters.riskScoreRange, [type]: value };
    updateFilter('riskScoreRange', newRange);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Challenge Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Risk Score Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Risk Score Range</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Min Risk Score</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.riskScoreRange.min}
                onChange={(e) => updateRiskRange('min', parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-600 text-center mt-1">
                {filters.riskScoreRange.min.toFixed(1)}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Max Risk Score</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.riskScoreRange.max}
                onChange={(e) => updateRiskRange('max', parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-green-200 to-red-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-gray-600 text-center mt-1">
                {filters.riskScoreRange.max.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Time Remaining</label>
          <div className="space-y-2">
            {timeOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="timeRemaining"
                  value={option.value}
                  checked={filters.timeRemaining === option.value}
                  onChange={(e) => updateFilter('timeRemaining', e.target.value)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Chain</label>
          <div className="space-y-2">
            {chains.map((chain) => (
              <label key={chain.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="chain"
                  value={chain.value}
                  checked={filters.chain === chain.value}
                  onChange={(e) => updateFilter('chain', e.target.value)}
                  className="mr-2 text-blue-600"
                />
                <span className="text-sm text-gray-700">{chain.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Min Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Min Value</label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              value={filters.minValue}
              onChange={(e) => updateFilter('minValue', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              placeholder="0.2"
            />
            <span className="absolute right-3 top-2 text-sm text-gray-500">ETH</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Minimum reward value</div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Confidence</label>
          <div className="flex flex-wrap gap-2">
            {confidenceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => updateFilter('confidence', level.value)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 border ${
                  filters.confidence === level.value
                    ? level.color || 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('riskScoreRange', { min: 8.0, max: 10.0 })}
            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200 transition-colors duration-200"
          >
            High Risk Only (8.0+)
          </button>
          <button
            onClick={() => updateFilter('timeRemaining', '24h')}
            className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full hover:bg-orange-200 transition-colors duration-200"
          >
            <Clock className="w-3 h-3 inline mr-1" />
            Urgent ({'< 24h'})
          </button>
          <button
            onClick={() => updateFilter('minValue', '1.0')}
            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 transition-colors duration-200"
          >
            High Value (1+ ETH)
          </button>
          <button
            onClick={() => {
              const resetFilters = {
                riskScoreRange: { min: 7.0, max: 10.0 },
                timeRemaining: 'all',
                chain: 'all',
                minValue: '0.2',
                confidence: 'all'
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengerFilters;