import { DollarSign } from "lucide-react";
import { ChangeEvent, MouseEventHandler } from "react";

type RequestRewardProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
export const RequestReward = ({
  value,
  error,
  onChange,
}: RequestRewardProps) => {
  return (
    <>
      <div>
        <label className="flex items-center  text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Reward (in USDC)
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="100"
          min="1"
          className={`w-full px-3 py-2 placeholder:text-gray-400 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
};
