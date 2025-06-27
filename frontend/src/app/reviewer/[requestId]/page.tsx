import { BackLinkBar } from "@/components/BackLinkBar";
import Navbar from "@/components/Navbar";
import { ReviewChallengeDetails } from "@/components/reviewer/details/ReviewChallengeDetails";
import { Address } from "viem";

const ReviewChallengePage: React.FC<{
  params: Promise<{ requestId: Address }>;
}> = async ({ params }) => {
  const { requestId } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      <BackLinkBar href="/reviewer" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReviewChallengeDetails requestId={requestId} />
      </div>
    </div>
  );
};

export default ReviewChallengePage;
