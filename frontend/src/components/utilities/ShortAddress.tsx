import { isAddress } from "@ethersproject/address";
import { Copy } from "lucide-react";
import { useState } from "react";
import { Address } from "viem";

type ShortAddressProps = {
  address: Address;
  canCopy?: boolean;
};

export const ShortAddress = ({
  address,
  canCopy = true,
}: ShortAddressProps) => {
  const [copied, setCopied] = useState(false);
  const copyUserAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address!);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
    // You could add a toast notification here
  };

  if (!isAddress(address)) return <span>Invalid address</span>;
  return (
    <button
      type="button"
      onClick={copyUserAddress}
      className={` gap-2 text-xs text-blue-400 flex items-center space-x-1  py-1 rounded ${
        canCopy
          ? "cursor-pointer text-blue-400 hover:text-blue-600"
          : "text-gray-500"
      }`}
    >
      <span className="font-mono">{`${address.slice(0, 6)}...${address.slice(
        -4
      )}`}</span>
      {canCopy &&
        (!copied ? (
          <Copy className="w-3 h-3" />
        ) : (
          <span className="text-gray-400">copied</span>
        ))}
    </button>
  );
};
