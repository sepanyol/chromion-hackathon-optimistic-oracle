import { useMyWrappedNfts } from "@/hooks/useMyWrappedNfts";
import { timeAgo } from "@/utils/time-ago";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import { CheckCircle } from "lucide-react";
import { Loader } from "../Loader";
import { ShortAddress } from "../utilities/ShortAddress";
import { PriceTag } from "./PriceTag";
import { ProposedPrice } from "./ProposedPrice";
import { TokenStatus } from "./TokenStatus";

export const MyTokens = () => {
  const { account } = useEvmClients();

  const nfts = useMyWrappedNfts({ account });

  console.log("MyTokens", nfts);
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            My Wrapped NFTs
          </h3>
        </div>
        {nfts.isLoading || nfts.isRefetching ? (
          <div className="flex justify-center py-10">
            <Loader size={48} />
          </div>
        ) : !nfts.data || nfts.data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-500">No wrapped NFTs yet</p>
            <p className="text-gray-400 text-sm">
              Create a wrapped NFT to enable your RWA to be part of DeFi
            </p>
          </div>
        ) : (
          <div className="divide-yoverflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wrapped NFT ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original NFT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Tag
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nfts.data.map((nft) => (
                  <tr
                    key={nft.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">{Number(nft.wNft)}</td>
                    <td className="px-6 py-4">
                      <ShortAddress address={nft.originNFT} />
                    </td>
                    <td className="px-6 py-4">{Number(nft.originId)}</td>
                    <td className="px-6 py-4">
                      {timeAgo.format(Number(nft.blockTimestamp) * 1000)}
                    </td>
                    <td className="px-6 py-4">
                      <ProposedPrice id={nft.wNft} />
                    </td>
                    <td className="px-6 py-4">
                      <PriceTag
                        id={nft.wNft}
                        assetFromList={
                          nft.currentValuation
                            ? nft.currentValuation.asset
                            : undefined
                        }
                        priceFromList={
                          nft.currentValuation
                            ? nft.currentValuation.amount
                            : undefined
                        }
                      />
                    </td>
                    <td className="px-6 py-4 flex justify-center">
                      <TokenStatus id={nft.wNft} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
