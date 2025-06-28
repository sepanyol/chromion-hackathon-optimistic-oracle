import clsx from "clsx";
import { ReceiptText } from "lucide-react";

type RequestContextProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
export const RequestContext = ({
  value,
  error,
  onChange,
}: RequestContextProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ReceiptText className="w-4 h-4 inline mr-1" />
          Provide more information for Solvers
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Any additional context or requirements thet helps the oracle to determine a proper response"
          rows={3}
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
