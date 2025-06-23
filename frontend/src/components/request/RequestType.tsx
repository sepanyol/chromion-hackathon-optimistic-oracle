import { ChangeEvent, MouseEventHandler } from "react";

type RequestType = {
  value: string;
  label: string;
  description: string;
};
type RequestTypeProps = {
  value: string;
  onChange: (value: string) => void;
};
export const RequestType = ({ value, onChange }: RequestTypeProps) => {
  const types = [
    {
      value: "Bool",
      label: "Yes or No",
      description: "Request a yes or no answer to the oracle",
    },
    {
      value: "Value",
      label: "Real World Asset (RWA) Valuation",
      description:
        "Request an estimation of the value of your RAW to the oracle",
    },
  ];

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {types.map((type) => (
            <div
              key={type.value}
              className={`relative p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                value === type.value
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => onChange(type.value)}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={value === type.value}
                  onChange={() => onChange(type.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {type.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
