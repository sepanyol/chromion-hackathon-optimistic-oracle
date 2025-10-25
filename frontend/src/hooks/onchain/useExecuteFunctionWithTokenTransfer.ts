"use client";
import { omit } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { Address, zeroAddress } from "viem";
import {
  useExecuteFunction,
  useExecuteFunctionProps,
} from "./useExecuteFunction";
import { useTokenAllowance } from "./useTokenAllowance";
import { useTokenApproval } from "./useTokenApproval";

export type useExecuteFunctionWithTokenTransferProps = {
  transferToken: Address;
  transferAmount: bigint;
  account: Address;
} & useExecuteFunctionProps;

export const useExecuteFunctionWithTokenTransfer = (
  props: useExecuteFunctionWithTokenTransferProps
) => {
  const {
    address,
    chainId,
    account,

    // for the approval process
    transferToken,
    transferAmount,
  } = props;

  ///
  /// ERC20 Allowance
  ///
  const allowanceProps = useTokenAllowance({
    address: transferToken,
    chainId,
    owner: account || zeroAddress,
    spender: address,
  });

  // checks if sufficient allowance is given based on the transfer amount
  const hasAllowance = Boolean(
    transferAmount > BigInt(0) &&
      allowanceProps.data &&
      allowanceProps.data >= transferAmount
  );

  ///
  /// ERC20 Approval Process for the Token
  ///
  const approvalProps = useTokenApproval({
    address: transferToken,
    chainId,
    spender: address,
    amount: transferAmount,
  });

  ///
  /// Execute Function that contains a token transfer
  ///
  const execProps = useExecuteFunction({
    ...omit({ ...props }, ["transferToken", "transferAmount"]),
    enabled: hasAllowance,
  });

  ///
  /// Logic
  ///
  const initiate = useCallback(() => {
    // if allowance is sufficient
    if (execProps.isEnabled && execProps.isReady) execProps.write();
    else if (approvalProps.isEnabled && approvalProps.isReady)
      approvalProps.write();
  }, [
    approvalProps.isReady,
    approvalProps.isEnabled,
    execProps.isReady,
    execProps.isEnabled,
  ]);

  const reset = () => {
    approvalProps.reset();
    execProps.reset();
  };

  // initiate execution after an initiated approval went through upfront
  useEffect(() => {
    // has upfront approval
    // and only do a refetch if the allowance was not good before and an allowance check is not already in progress
    if (
      approvalProps.hash &&
      approvalProps.execution.isSuccess &&
      !allowanceProps.isPending &&
      !allowanceProps.isLoading &&
      !allowanceProps.isRefetching &&
      !hasAllowance
    ) {
      allowanceProps.refetch();
    }
  }, [
    approvalProps.hash,
    approvalProps.execution.isSuccess,
    allowanceProps.isPending,
    allowanceProps.isLoading,
    allowanceProps.isRefetching,
    hasAllowance,
  ]);

  useEffect(() => {
    // execute this only,
    // if there was an upfront approval,
    // the allowance is sufficient and the execution is ready to get executed
    // and it's not pending already
    // otherwise its triggered through initiate()
    if (
      Boolean(
        approvalProps.hash &&
          approvalProps.execution.isSuccess &&
          execProps.isEnabled &&
          execProps.isReady &&
          !execProps.hash &&
          !execProps.execution.isPending &&
          !execProps.execution.isSuccess
      )
    ) {
      // reset
      // approvalProps.reset();
      execProps.write && execProps.write();
    }
  }, [
    approvalProps.hash,
    approvalProps.execution.isSuccess,
    execProps.isEnabled,
    execProps.isReady,
    execProps.execution.isSuccess,
    execProps.hash,
    execProps.write,
  ]);

  // reset everything on any error
  useEffect(() => {
    if (
      approvalProps.execution.isError ||
      execProps.execution.isError ||
      execProps.execution.isSuccess
    ) {
      reset();
      // approvalProps.reset();
      allowanceProps.refetch();
    }
  }, [
    approvalProps.execution.isError,
    execProps.execution.isError,
    execProps.execution.isSuccess,
  ]);

  return {
    initiate,
    reset,
    hasAllowance,
    approval: approvalProps,
    allowance: allowanceProps,
    execute: execProps,
  };
};
