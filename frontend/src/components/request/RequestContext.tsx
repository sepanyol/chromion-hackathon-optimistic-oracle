import { ReceiptText } from "lucide-react";

type RequestContextProps = {
  value: string;
  onChange: (value: string) => void;
};
export const RequestContext = ({ value, onChange }: RequestContextProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ReceiptText className="w-4 h-4 inline mr-1" />
          Additional Details (Optional, but heavily recommended)
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Any additional context or requirements thet helps the oracle to determine a proper response"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>
    </>
  );
};
