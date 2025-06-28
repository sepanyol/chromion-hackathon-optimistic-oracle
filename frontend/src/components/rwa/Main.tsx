"use client";

import { useAccount } from "wagmi";
import { MyTokens } from "./MyTokens";
import { CreateNFTWrapper } from "./CreateNFTWrapper";
import { MyValuations } from "./MyValuations";
import CreateRequestProvider from "../request/CreateRequestProvider";
import { CreateRequest } from "../request/CreateRequest";

export const Main = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {!isConnected ? (
        <div>please connect</div>
      ) : (
        <CreateRequestProvider>
          {/* <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div> */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-4">
              <CreateNFTWrapper />
              <MyValuations />
              <MyTokens />
            </div>
          </div>
        </CreateRequestProvider>
      )}
    </>
  );
};
