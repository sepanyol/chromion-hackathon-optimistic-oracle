// components/RequestModal.tsx
"use client";
import { Info, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { RequestChallengePeriod, ValidPeriods } from "./RequestChallengePeriod";
import { RequestContext } from "./RequestContext";
import { RequestDescription } from "./RequestDescription";
import { RequestReward } from "./RequestReward";
import { RequestType } from "./RequestType";
import { useCreateRequestContext } from "./CreateRequestProvider";
import { RequestTruthMeaning } from "./RequestTruthMeaning";

interface RequestModalProps {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

type FormData = {
  description: string;
  type: "Bool" | "Value";
  reward: string;
  deadline: string;
  period: ValidPeriods;
  details: string;
  truthMeaning: string;
};

const RequestModal: React.FC<RequestModalProps> = ({
  onUpdate,
  onSubmit,
  onClose,
  isSubmitting,
  isSubmitDisabled,
}) => {
  const initialFormData: FormData = {
    description: "",
    type: "Bool",
    reward: "",
    deadline: "",
    period: 86400,
    details: "",
    truthMeaning: "",
  };
  const createContext = useCreateRequestContext();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.details.trim()) {
      newErrors.details = "This is required";
    }

    if (!formData.reward || parseInt(formData.reward) <= 0) {
      newErrors.reward = "Valid reward amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit();
  };

  const handleInputChange = (field: string, value: string | ValidPeriods) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    onUpdate && onUpdate(formData);
  }, [formData]);

  const handleOnClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Request
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new request for the oracle network
            </p>
          </div>
          <button
            onClick={handleOnClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative space-y-4">
            <RequestType
              onChange={(value) => handleInputChange("type", value)}
              value={formData.type}
            />

            {formData.type == "Value" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ENTER NFT ADDRESS FORM FIELD
              </div>
            )}

            <RequestDescription
              onChange={(value) => handleInputChange("description", value)}
              error={errors.description}
              value={formData.description}
            />

            {/* Reward and Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RequestReward
                onChange={(value) => handleInputChange("reward", value)}
                error={errors.reward}
                value={formData.reward}
              />

              <RequestChallengePeriod
                onChange={(value) => handleInputChange("period", value)}
                value={formData.period}
              />
            </div>

            <RequestContext
              onChange={(value) => handleInputChange("details", value)}
              error={errors.details}
              value={formData.details}
            />

            <RequestTruthMeaning
              onChange={(value) => handleInputChange("truthMeaning", value)}
              value={formData.truthMeaning}
            />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">
                    How it works:
                  </p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• Your request will be posted to the oracle network</li>
                    <li>• Data providers can submit proposals with evidence</li>
                    <li>• Community can challenge incorrect submissions</li>
                    <li>• Rewards are distributed to honest participants</li>
                  </ul>
                </div>
              </div>
            </div>

            {createContext.state.isSubmitting && (
              <div className="absolute inset-0 bg-white/80 -m-1 z-[60]"></div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleOnClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSubmitDisabled}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
