"use client";

type ReviewSelectorProps = {
  disabled?: boolean;
  value: boolean | null;
  onChange: (value: boolean) => void;
};

export const ReviewSelector = ({
  value,
  onChange,
  disabled = false,
}: ReviewSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div
        className={`relative p-3 border rounded-lg cursor-pointer transition-all duration-200 flex gap-2 items-start ${
          value === true
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : `border-gray-200 ${
                disabled
                  ? `opacity-30`
                  : `hover:border-gray-300 hover:bg-gray-50`
              }`
        }`}
        onClick={() => !disabled && onChange(true)}
      >
        <input
          type="radio"
          checked={value === true}
          onChange={(event) => {
            event.preventDefault();
            !disabled && onChange(true);
          }}
          className="text-blue-600 size-6"
        />
        <div>
          <div className="font-bold text-gray-900">Support Challenger</div>
          <div className="text-xs text-gray-500">
            If you use this option, you're going to support the answer given by
            the challenger.
          </div>
        </div>
      </div>
      <div
        className={`relative p-3 border rounded-lg cursor-pointer transition-all duration-200 flex gap-2 items-start ${
          value === false
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : `border-gray-200 ${
                disabled
                  ? `opacity-30`
                  : `hover:border-gray-300 hover:bg-gray-50`
              }`
        }`}
        onClick={() => onChange(false)}
      >
        <input
          type="radio"
          checked={value === false}
          onChange={(event) => {
            event.preventDefault();
            onChange(false);
          }}
          className="text-blue-600 size-6"
        />
        <div>
          <div className="font-bold text-gray-900">Support Proposer</div>
          <div className="text-xs text-gray-500">
            If you use this option, you're going to support the answer given by
            the initial proposer.
          </div>
        </div>
      </div>
    </div>
  );
};
