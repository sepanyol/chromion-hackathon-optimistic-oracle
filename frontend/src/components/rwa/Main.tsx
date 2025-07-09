"use client";
import { useEvmClients } from "@s3panyol/use-evm-transaction-flow";
import { Button } from "../Button";
import { CreateNFTRequest } from "../request/CreateNFTRequest";
import CreateRequestProvider, {
  ActionTypes,
  useCreateRequestContext,
} from "../request/CreateRequestProvider";
import { MyTokens } from "./MyTokens";
import { MyValuations } from "./MyValuations";
import { ButtonWalletConnect } from "../ButtonConnectWallet";

export const Main = () => {
  const { isReady, isConnected } = useEvmClients();
  const createRequest = useCreateRequestContext();

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="bg-white px-6 py-4 rounded-lg shadow-sm border gap-4 flex flex-col border-gray-200 w-full">
          <h2 className="text-4xl">
            Create a Real World Asset Valuation Request
          </h2>
          <p>
            Bringing real assets on-chain unlocks new opportunities — but
            accurate and trust-minimized valuations remain a key challenge.
          </p>
          <p>
            With our Optimistic Oracle, you can initiate requests for
            decentralized evaluations of tokenized RWAs — such as real estate,
            art, commodities, or private equity — and receive dispute-resilient
            answers secured by community bonds.
          </p>
          <h2 className="text-2xl">Why Create a Request?</h2>
          <ul className="list-disc list-outside ml-6 space-y-3">
            <li>
              <span className="font-bold">Independent Evaluation</span>
              <br />
              Let a permissionless network of participants submit and review
              answers to your valuation question.
            </li>
            <li>
              <span className="font-bold">Dispute Protection</span>
              <br />
              Answers go through a challenge window to ensure correctness, and
              are secured by financial bonds.
            </li>
            <li>
              <span className="font-bold">Incentivized Resolution</span>
              <br />
              Proposers, challengers, and reviewers are rewarded for helping
              bring high-integrity data on-chain.
            </li>
            <li>
              <span className="font-bold">On-Chain Ready</span>
              <br />
              Once resolved, your valuation can be used directly as collateral,
              input for smart contracts, or for marketplace pricing.
            </li>
          </ul>
          <h2 className="text-2xl">
            Ready to initiate your first RWA valuation?
          </h2>

          {!isConnected ? (
            <>
              <p>
                Connect your wallet to get started and fund your request with
                just a few clicks.
              </p>
              <div>
                <ButtonWalletConnect />
              </div>
            </>
          ) : (
            <div>
              <Button
                onClick={() => {
                  createRequest.dispatch({ type: ActionTypes.OpenModal });
                }}
              >
                What value has my tokenized asset?
              </Button>
            </div>
          )}
        </div>
      </div>

      {isConnected && isReady && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <MyValuations />
            <MyTokens />
          </div>
          <CreateNFTRequest />
        </div>
      )}
    </>
  );
};
