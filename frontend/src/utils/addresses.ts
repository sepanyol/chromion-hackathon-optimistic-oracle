import { getAddress } from "@ethersproject/address";

export const isAddress = (
  value?: string | null | undefined
): string | false => {
  if (!value) return false;

  try {
    return getAddress(value.toLowerCase());
  } catch {
    return false;
  }
};

export const isSameAddress = (a?: string, b?: string): boolean =>
  a === b || a?.toLowerCase() === b?.toLowerCase(); // Lazy-lowercases the addresses
;;