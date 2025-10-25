import clsx from "clsx";

type RequestTokenIdProps = {
  disabled?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
export const RequestTokenId = ({
  disabled = false,
  value,
  error,
  onChange,
}: RequestTokenIdProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          Enter the Token ID
        </label>
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="123"
          className={clsx([
            "w-full px-3 py-2 border  placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-gray-300",
            error && "border-red-300! focus:ring-red-500",
          ])}
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
};
