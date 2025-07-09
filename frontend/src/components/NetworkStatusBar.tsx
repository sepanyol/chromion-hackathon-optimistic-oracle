"use client";
import { fetchGasPrice } from "@/utils/api/fetchGasPrice";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { avalancheFuji } from "viem/chains";

export const NetworkStatusBar = () => {
  const { isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const [currentChainId, setCurrentChainId] = useState<string>();
  const { refetch, data, isFetching, isLoading } = useQuery({
    queryKey: ["gasfees", currentChainId],
    queryFn: async () => fetchGasPrice(Number(currentChainId)),
    enabled: false,
  });

  useEffect(() => {
    if (!caipNetwork) setCurrentChainId(avalancheFuji.id.toString());
    else setCurrentChainId(caipNetwork.id.toString());
  }, [caipNetwork]);

  useEffect(() => {
    if (currentChainId) refetch();
  }, [refetch, currentChainId]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center space-x-6 text-sm min-h-8">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Network:</span>
            {/* Network Status (only show if wallet connected) */}
            {isConnected && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  {caipNetwork && caipNetwork.name}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Gas:</span>
            <span className="font-medium">
              {isLoading || isFetching ? (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              ) : data && data.medium ? (
                <span className="text-green-600">
                  {data.medium.suggestedMaxFeePerGas} gwei
                </span>
              ) : (
                <span>n/a</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
