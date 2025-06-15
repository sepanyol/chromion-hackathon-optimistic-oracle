// components/SolverFilters.tsx
'use client';
import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

interface SolverFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const SolverFilters: React.FC<SolverFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    rewardRange: { min: '0.1', max: '3.2' },
    chain: 'all',
    category: 'all',
    deadline: 'all',
    difficulty: 'all'
  });

  const chains = [
    { value: 'all', label: 'All Chains' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'base', label: 'Base' },
    { value: 'polygon', label: 'Polygon' },
    { value: 'avalanche', label: 'Avalanche' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'defi', label: 'DeFi' },
    { value: 'price-feeds', label: 'Price Feeds' },
    { value: 'weather', label: 'Weather' },
    { value: 'sports', label: 'Sports' },
    { value: 'rwa', label: 'Real World Assets' }
  ];

  const deadlines = [
    { value: 'all', label: 'All Deadlines' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90+ days' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ];

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const updateRewardRange = (type: 'min' | 'max', value: string) => {
    const newRange = { ...filters.rewardRange, [type]: value };
    updateFilter('rewardRange', newRange);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Reward Range */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reward Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.1"
              value={filters.rewardRange.min}
              onChange={(e) => updateRewardRange('min', e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.1"
            />
            <span className="text-gray-500 text-sm">ETH -</span>
            <input
              type="number"
              step="0.1"
              value={filters.rewardRange.max}
              onChange={(e) => updateRewardRange('max', e.target.value)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3.2"
            />
            <span className="text-gray-500 text-sm">ETH</span>
          </div>
        </div>

        {/* Chain */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chain</label>
          <div className="relative">
            <select
              value={filters.chain}
              onChange={(e) => updateFilter('chain', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {chains.map((chain) => (
                <option key={chain.value} value={chain.value}>
                  {chain.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
          <div className="flex space-x-1">
            {deadlines.slice(1).map((deadline) => (
              <button
                key={deadline.value}
                onClick={() => updateFilter('deadline', deadline.value)}
                className={`px-3 py-2 text-xs  rounded-sm transition-all duration-200 ${
                  filters.deadline === deadline.value
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {deadline.value}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <div className="flex space-x-1">
            {difficulties.slice(1).map((difficulty) => (
              <button
                key={difficulty.value}
                onClick={() => updateFilter('difficulty', difficulty.value)}
                className={`px-2 py-1 text-xs rounded-full transition-all duration-200 border ${difficulty.color} ${
                  filters.difficulty === difficulty.value
                    ? `${difficulty.color} border-current`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                }`}
              >
                {difficulty.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.chain !== 'all' || filters.category !== 'all' || filters.deadline !== 'all' || filters.difficulty !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.chain !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {chains.find(c => c.value === filters.chain)?.label}
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {categories.find(c => c.value === filters.category)?.label}
                </span>
              )}
              {filters.deadline !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {deadlines.find(d => d.value === filters.deadline)?.label}
                </span>
              )}
              {filters.difficulty !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {difficulties.find(d => d.value === filters.difficulty)?.label}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                const resetFilters = {
                  rewardRange: { min: '0.1', max: '3.2' },
                  chain: 'all',
                  category: 'all',
                  deadline: 'all',
                  difficulty: 'all'
                };
                setFilters(resetFilters);
                onFiltersChange(resetFilters);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolverFilters;