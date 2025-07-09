"use client";
import { BackLinkBar } from "@/components/BackLinkBar";
import NavBar from "@/components/NavBar";
import OracleProvider from "@/components/OracleProvider";
import RequestProvider from "@/components/RequestProvider";
import { ReviewChallengeDetails } from "@/components/reviewer/details/ReviewChallengeDetails";
import { useParams } from "next/navigation";
import { ToastContainer } from "react-toastify";
import { Address } from "viem";

const ReviewChallengePage: React.FC = () => {
  const { requestId } = useParams<{ requestId: Address }>();
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <BackLinkBar href="/reviewer" label="Back to Overview" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <OracleProvider>
          <RequestProvider requestId={requestId}>
            <ReviewChallengeDetails />
          </RequestProvider>
        </OracleProvider>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ReviewChallengePage;
