"use client";

import { FullRequestType } from "@/types/Requests";
import clsx from "clsx";
import { Check } from "lucide-react";
import { PropsWithChildren } from "react";

type RequestDetailsProps = {
  request: FullRequestType;
} & PropsWithChildren;

export const RequestDetails = ({ request, children }: RequestDetailsProps) => {
  const assessment = request.scoring
    ? [
        {
          score: request.scoring.heatmap.clarity / 10,
          label: "Is the question and context clearly expressed?",
        },
        {
          score: request.scoring.heatmap.logical_consistency / 10,
          label:
            " Are all rules and conditions logically sound and consistent?",
        },
        {
          score: request.scoring.heatmap.completeness / 10,
          label: "Is all necessary information included to answer reliably?",
        },
        {
          score: request.scoring.heatmap.source_trust / 10,
          label: "How trustworthy and clearly defined is the source?",
        },
        {
          score: request.scoring.heatmap.ambiguity / 10,
          label: "How ambiguous is the context? (10 = no ambiguity)",
        },
        {
          score: request.scoring.heatmap.time_reference / 10,
          label: "Are timeframes, deadlines, or conditions well defined?",
        },
      ]
    : [];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="uppercase text-gray-500 font-bold">Question:</div>
        <div className="">{request.question}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="uppercase text-gray-500 font-bold">Context:</div>
        <div className="">{request.context}</div>
      </div>
      {request.truthMeaning && (
        <div className="flex flex-col gap-1">
          <div className="uppercase text-gray-500 font-bold">
            Truth meaning:
          </div>
          <div className="">{request.truthMeaning}</div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="uppercase text-gray-500 font-bold">
          MCP Risk Assessment:
        </div>
        <div
          className={clsx([
            "p-4 border  rounded-lg",
            request.scoring &&
              request.scoring.final_decision == 1 &&
              "border-green-300 bg-green-100",

            request.scoring &&
              request.scoring.final_decision == 2 &&
              "border-orange-300 bg-orange-100",

            request.scoring &&
              request.scoring.final_decision == 3 &&
              "border-red-300 bg-red-100",

            !request.scoring && "border-blue-200 bg-blue-50 text-gray-400",
          ])}
        >
          {!request.scoring && "waiting for assessment..."}
          {request.scoring && (
            <div className="flex flex-col gap-3">
              <div className="font-bold">
                {request.scoring.final_decision == 1 && "Low"}
                {request.scoring.final_decision == 2 && "Medium"}
                {request.scoring.final_decision == 3 && "High"} Risk Score:{" "}
                {request.scoring.score / 10}/10
              </div>
              <div>
                <table className="table-auto">
                  <tbody>
                    {assessment.map((item, i) => (
                      <tr key={i}>
                        <td className="align-top font-bold text-right whitespace-nowrap">
                          {item.score}/10
                        </td>
                        <td className="pl-3">{item.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
