// components/RequestModal.tsx
"use client";
import { Info, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCreateRequestContext } from "./CreateRequestProvider";
import { ValidPeriods } from "./RequestChallengePeriod";
import { RequestContext } from "./RequestContext";
import { RequestTokenAddress } from "./RequestTokenAddress";
import { RequestTokenId } from "./RequestTokenId";

interface NFTRequestModalProps {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}

type FormData = {
  details: string;
  tokenAddress: string;
  tokenId: string;
};

const NFTRequestModal: React.FC<NFTRequestModalProps> = ({
  onUpdate,
  onSubmit,
  onClose,
  isSubmitting,
  isSubmitDisabled,
}) => {
  const initialFormData: FormData = {
    details: "",
    tokenAddress: "",
    tokenId: "",
  };
  const createContext = useCreateRequestContext();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.details.trim()) {
      newErrors.details = "Context is required";
    }

    if (!formData.tokenAddress.trim()) {
      newErrors.tokenAddress = "Token address is required";
    }

    if (!formData.tokenId.trim()) {
      newErrors.tokenId = "Token ID is required";
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
              Evaluate your Real World Asset (RWA)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a new inquiry for the oracle network to evaluate the
              worthiness of your RWA
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
            <RequestTokenAddress
              tokenName={createContext.state.tokenName || ""}
              tokenSymbol={createContext.state.tokenSymbol || ""}
              onChange={(value) => handleInputChange("tokenAddress", value)}
              error={errors.tokenAddress}
              value={formData.tokenAddress}
            />

            <RequestTokenId
              onChange={(value) => handleInputChange("tokenId", value)}
              disabled={!formData.tokenAddress}
              error={
                errors.tokenId ||
                (createContext.state.errorNotOwner
                  ? "You're not the owner of this token id"
                  : "")
              }
              value={formData.tokenId}
            />

            <RequestContext
              onChange={(value) => handleInputChange("details", value)}
              error={errors.details}
              value={formData.details}
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
                    <li>
                      Step 1: Your NFT will be wrapped into an NFT that is
                      capable to interact directly with the oracle
                    </li>
                    <li>
                      Step 2: After your NFT is being wrapped, a request to the
                      oracle is issued, in order to estimate your NFT
                    </li>
                    <li>Step 3: The oracle will then provide an outcaome</li>
                    <li>Step 4: You can use this outcame as a price tag</li>
                  </ul>
                </div>
              </div>
            </div>

            {isSubmitting && (
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

export default NFTRequestModal;
