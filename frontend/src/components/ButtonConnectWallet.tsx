"use client";
import { useAppKit, useAppKitState } from "@reown/appkit/react";
import { Loader } from "./Loader";

export const ButtonWalletConnect = () => {
  const modal = useAppKit();
  const { open: isOpen } = useAppKitState();

  return (
    <button
      onClick={() => {
        modal.open();
      }}
      className="equo-gradient px-4 py-2 rounded-full text-sm cursor-pointer"
    >
      {isOpen ? (
        <span className="flex gap-2 items-center">
          <Loader className="text-white! h-5" /> <span>Connecting...</span>
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
};
