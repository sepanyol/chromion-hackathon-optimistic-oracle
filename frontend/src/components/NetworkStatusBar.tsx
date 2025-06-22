import { fetchGasPrice } from "@/utils/api/fetchGasPrice";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { avalancheFuji } from "viem/chains";

export const NetworkStatusBar = () => {
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
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Network:</span>
            <span className="font-medium text-gray-600">
              {caipNetwork && caipNetwork.name}
            </span>
          </div>
          {isLoading || isFetching ? (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            data &&
            data.medium && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Gas:</span>
                  <span className="font-medium text-green-600">
                    {data.medium.suggestedMaxFeePerGas} gwei
                  </span>
                </div>
                {/* TODO check if this can be done through a nested collection in subgraph
                 <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Active Requests:</span>
                  <span className="font-medium text-gray-600">[GET FROM DASHBOARD API]</span>
                </div> */}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};
