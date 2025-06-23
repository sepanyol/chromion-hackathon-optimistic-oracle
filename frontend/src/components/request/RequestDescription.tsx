import { FileText } from "lucide-react";

type RequestDescriptionProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};
export const RequestDescription = ({
  value,
  error,
  onChange,
}: RequestDescriptionProps) => {
  return (
    <>
      {/* Request Description */}
      <div>
        <label className=" flex items-center text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Request Description
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Will Tesla stock price exceed $300 by end of Q1 2024?"
          rows={3}
          className={`w-full px-3 py-2 border placeholder:text-gray-400 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
            error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
};
