import clsx from "clsx";

type RequestTokenAddressProps = {
  value: string;
  tokenName?: string;
  tokenSymbol?: string;
  error?: string;
  onChange: (value: string) => void;
};
export const RequestTokenAddress = ({
  value,
  tokenName,
  tokenSymbol,
  error,
  onChange,
}: RequestTokenAddressProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          Enter your NFT Token addresss that should be valuated
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0x"
          className={clsx([
            "w-full px-3 py-2 border  placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300",
            error && "border-red-300! focus:ring-red-500",
          ])}
        />
        {(tokenName || tokenSymbol) && (
          <p className="text-green-800 font-bold text-sm mt-1">
            Token info: {tokenName}
            {tokenSymbol ? ` (${tokenSymbol})` : ""}
          </p>
        )}
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
};
