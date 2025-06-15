// components/CrossChainStatus.tsx
'use client';
import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface CrossChainNetwork {
  network: string;
  status: 'Active' | 'Syncing';
}

interface CrossChainStatusProps {
  networks: CrossChainNetwork[];
}

const CrossChainStatus: React.FC<CrossChainStatusProps> = ({ networks }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Syncing':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'Syncing':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      default:
        return 'text-red-600 bg-red-50 border border-red-200';
    }
  };

  const getNetworkLogo = (network: string) => {
    const logos = {
      'Avalanche': '🔺',
      'Ethereum': 'Ξ',
      'Base': '🔵',
      'Polygon': '💜',
      'Arbitrum': '🔷'
    };
    return logos[network as keyof typeof logos] || '⚡';
  };

  return (
    <div className="bg-gradient-to-br from-[#EFF6FF] to-[#E0E7FF] rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mt-[-14px] justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Status</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {networks.map((chain, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
             
              <div>
                <span className="text-sm font-medium text-[#4B5563] group-hover:text-gray-900 transition-colors">
                  {chain.network}
                </span>
             
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(chain.status)}
              <span className={`inline-flex items-center text-[#000000] px-2 py-1 rounded-full text-sm font-semibold  transition-all duration-200 `}>
                {chain.status}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default CrossChainStatus;