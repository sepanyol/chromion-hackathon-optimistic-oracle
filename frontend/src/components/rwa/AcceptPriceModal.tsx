import { X } from "lucide-react";
import { FormEvent } from "react";

interface AcceptPriceModalProps {
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  price: string;
  requestId: string;
  proposerId: string;
  challengerId?: string | null;
  onSubmit: () => void;
  onClose: () => void;
}

export const AcceptPriceModal = ({
  isSubmitDisabled,
  isSubmitting,
  price,
  requestId,
  proposerId,
  challengerId = null,
  onClose,
  onSubmit,
}: AcceptPriceModalProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Review Price Proposal
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              The price you see here is the price the oracle proposed to you.
              You can accept the price, and it will be set to your current price
              tag of you NFT.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative space-y-4 flex flex-col p-6 border-b border-gray-200">
          <div>
            <span className="font-bold">Proposed price:</span> {price}
          </div>
          <div>
            <span className="font-bold">Request ID:</span> {requestId}
          </div>
          <div>
            <span className="font-bold">Proposer ID:</span> {proposerId}
          </div>
          <div>
            <span className="font-bold">Challenger ID:</span>{" "}
            {challengerId ?? "not challenged"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
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
                <span>Accept Price</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
