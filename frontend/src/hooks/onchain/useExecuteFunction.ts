"use client";
import { useCallback, useMemo } from "react";
import { Abi, Address, decodeEventLog, isHex } from "viem";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isSameAddress } from "./../../utils/addresses";

export type useExecuteFunctionProps = {
  address: Address;
  chainId: number;
  abi: Abi;
  functionName: string;
  args: any[];
  eventNames: string[];
  account?: Address;
  value?: bigint;
  enabled?: boolean;
  onEvent?: (event: any) => void;
  onEventMatch?: (event: any) => void;
  onError?: (errorSimulate: any, errorWrite: any) => void;
};

export const useExecuteFunction = ({
  address,
  chainId,
  abi,
  functionName,
  args,
  eventNames,
  account,
  value,
  enabled: _enabled,
  onEvent,
  onEventMatch,
  onError,
}: useExecuteFunctionProps) => {
  const enabled = useMemo(() => {
    return Boolean(address && chainId && abi && functionName && _enabled);
  }, [address, chainId, abi, functionName, _enabled]);

  const simulate = useSimulateContract({
    address,
    chainId,
    abi,
    functionName,
    args,
    query: { enabled },
    ...(account ? { account } : {}),
    ...(value && value > BigInt(0) ? { value } : {}),
  });

  const {
    data: dataSimulate,
    isSuccess: isSuccessSimulate,
    error: errorSimulate,
  } = simulate;

  const execution = useWriteContract();

  const {
    writeContract,
    data: hash,
    reset: resetWriteContract,
    error: errorWrite,
  } = execution;

  // write function that needs to be called
  const write = useCallback(() => {
    if (dataSimulate && dataSimulate.request && writeContract) {
      writeContract(dataSimulate.request);
    }
  }, [isSuccessSimulate, dataSimulate, writeContract]);

  const reset = useCallback(() => {
    resetWriteContract && resetWriteContract();
  }, [resetWriteContract]);

  const { data: txData, error: txError } = useWaitForTransactionReceipt({
    hash,
    chainId,
    query: { enabled: isHex(hash) },
  });

  if (txData && txData.logs) {
    txData.logs
      .filter(() => eventNames && eventNames.length)
      .filter((log) => isSameAddress(address, log.address))
      .forEach((log) => {
        const event = decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        }) as any;
        onEvent && onEvent(event);
        if (eventNames.indexOf(`${event.eventName}`) > -1)
          onEventMatch && onEventMatch(event);
      });
  }

  if (txError) console.log("[ERROR]", { reason: txError.message });

  if (onError) {
    if (errorWrite) onError(null, errorWrite);
    if (errorSimulate) onError(errorSimulate, null);
  }

  return {
    write,
    reset,
    simulate,
    execution,
    isEnabled: enabled,
    isReady: isSuccessSimulate,
    hash,
    logs: txData ? txData.logs : null,
  };
};
