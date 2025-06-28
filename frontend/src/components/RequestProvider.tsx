"use client";
import { createContext, PropsWithChildren, useContext } from "react";
import { Address, zeroAddress } from "viem";

type RequestContextType = {
  requestId: Address;
};

const initialState: RequestContextType = {
  requestId: zeroAddress,
};

export const RequestContext = createContext(initialState);

export const useRequestContext = () => {
  const context = useContext(RequestContext);
  if (context === undefined)
    throw new Error("useRequestContext was used outside of its provider");

  if (context.requestId == zeroAddress)
    throw new Error("requestId is missing in RequestProvider");
  return context;
};

const RequestProvider = function ({
  children,
  requestId,
}: RequestContextType & PropsWithChildren) {
  return (
    <RequestContext.Provider value={{ requestId }}>
      {children}
    </RequestContext.Provider>
  );
};

export default RequestProvider;
