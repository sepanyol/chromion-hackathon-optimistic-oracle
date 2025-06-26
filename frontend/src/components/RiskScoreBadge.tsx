import clsx from "clsx";
import { isNumber } from "lodash";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

type RiskScoreBadgeProps = {
  riskLevel: number | null;
  score: number | null;
};

export const RiskScoreBadge = ({ riskLevel, score }: RiskScoreBadgeProps) => {
  return (
    <span
      className={clsx([
        "inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border",
        riskLevel === 1 && "bg-green-100 text-green-800 border-green-200",
        riskLevel === 2 && "bg-orange-100 text-orange-800 border-orange-200",
        riskLevel === 3 && "bg-red-100 text-red-800 border-red-200",
        !isNumber(riskLevel) && "bg-gray-100 text-gray-800 border-gray-200",
      ])}
    >
      {riskLevel == 1 ? (
        <CheckCircle className="w-4 h-4" />
      ) : isNumber(riskLevel) ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      <span>
        {!isNumber(riskLevel) && !isNumber(score) ? (
          <>Waiting for assessment...</>
        ) : (
          <>
            {riskLevel === 1 && "Low"}
            {riskLevel === 2 && "Medium"}
            {riskLevel === 3 && "High"} Risk Score: {score! / 10}/10
          </>
        )}
      </span>
    </span>
  );
};
