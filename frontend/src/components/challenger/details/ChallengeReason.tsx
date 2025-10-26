import { FileText } from "lucide-react";

type ChallengeReasonProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export const ChallengeReason = ({
  value,
  error,
  onChange,
}: ChallengeReasonProps) => {
  return (
    <>
      <div>
        <label className=" flex items-center text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Enter reason for challenge
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., the proposed answer is simply not true, if you look at..."
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
