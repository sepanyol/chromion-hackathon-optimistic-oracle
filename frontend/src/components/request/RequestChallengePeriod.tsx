import { Clock } from "lucide-react";

export type ValidPeriods = 300 | 43200 | 86400 | 172800;
type RequestChallengePeriodProps = {
  value: ValidPeriods;
  onChange: (value: ValidPeriods) => void;
};
export const RequestChallengePeriod = ({
  value,
  onChange,
}: RequestChallengePeriodProps) => {
  return (
    <>
      <div>
        <label className="flex items-center  text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          Challenge Period <br />
          {/* <small>
            After receiving a proposed answer, this time frame should be used as
            a threshold where the oracle can challenge the proposed answer
          </small> */}
        </label>
        <div className="flex gap-2 w-full">
          {([172800, 86400, 43200, 300] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              disabled={value === tab}
              onClick={() => value !== tab && onChange(tab)}
              className={`p-3 w-full text-xs font-medium rounded-md transition-all duration-200 ${
                value === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-300 text-gray-800 hover:text-gray-900"
              }`}
            >
              {tab > 600
                ? `${(tab / 86400).toLocaleString(navigator.language, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                  })}d`
                : `${tab / 60}m`}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
