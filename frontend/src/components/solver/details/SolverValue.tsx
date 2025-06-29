import clsx from "clsx";
import { CircleDollarSign } from "lucide-react";

type SolverValueProps = {
  disabled?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
export const SolverValue = ({
  disabled = false,
  value,
  error,
  onChange,
}: SolverValueProps) => {
  return (
    <>
      <div>
        {!disabled && (
          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            Enter the necessary amount
          </label>
        )}
        <div className="relative max-w-full mx-auto">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <CircleDollarSign size={18} className="text-gray-300 " />
          </div>
          <input
            type="number"
            value={value || ""}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            min={1}
            className={clsx([
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  placeholder:text-gray-400 text-gray-800",
              error && "border-red-300! focus:ring-red-500",
            ])}
            placeholder={(12.34).toLocaleString(navigator.language)}
          />
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
};
