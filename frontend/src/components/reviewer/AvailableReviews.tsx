// components/MyActiveChallenges.tsx
"use client";
import { AvailableReviewsType } from "@/types/Requests";
import { AlertCircle } from "lucide-react";
import { IsNewBadge } from "../NewBadge";
import { RiskScoreBadge } from "../RiskScoreBadge";
import { ShortAddress } from "../utilities/ShortAddress";
import { ReviewBar } from "./ReviewBar";
import { Button } from "../Button";
import Link from "next/link";
import { useAccount } from "wagmi";
import { isSameAddress } from "@/utils/addresses";

type AvailableReviewsProps = {
  reviews: AvailableReviewsType[];
};

export const AvailableReviews = ({ reviews }: AvailableReviewsProps) => {
  const { address: accountAddress } = useAccount();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Reviews
          </h3>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <AlertCircle className="w-8 h-8 mx-auto" />
          </div>
          <p className="text-gray-500">No reviews available</p>
          <p className="text-gray-400 text-sm">
            Review challenges to see your recent reviews here
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex flex-1 gap-1 text-gray-900 items-center ">
                      {Number(review.votesFor) + Number(review.votesAgainst) ===
                        0 && <IsNewBadge />}
                      <span className="font-bold">Q:</span>
                      <span>{review.request.question}</span>
                    </div>
                    <div className="flex justify-end">
                      <RiskScoreBadge
                        riskLevel={
                          review.request.scoring
                            ? Number(review.request.scoring.final_decision)
                            : null
                        }
                        score={
                          review.request.scoring
                            ? Number(review.request.scoring.score)
                            : null
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 md:gap-2">
                    <div className="flex flex-col col-span-2 md:col-span-1">
                      <span className="text-sm text-gray-500">
                        answered by:
                      </span>
                      <ShortAddress
                        canCopy={false}
                        address={review.proposal.proposer.id}
                      />
                    </div>
                    <div className="flex flex-col col-span-2 md:col-span-1">
                      <span className="text-sm text-gray-500">
                        challenged by:
                      </span>
                      <ShortAddress
                        canCopy={false}
                        address={review.challenger.id}
                      />
                    </div>

                    <div className="flex flex-col col-span-4 md:col-span-2">
                      <span className="text-sm text-gray-500 mb-2">
                        Reviews
                      </span>
                      <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                        {Number(review.votesFor) +
                          Number(review.votesAgainst) ===
                        0 ? (
                          "No reviews yet. Be the first!"
                        ) : (
                          <ReviewBar
                            challengeVotes={review.votesFor}
                            proposalVotes={review.votesAgainst}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    {accountAddress &&
                    (isSameAddress(
                      review.request.requester.id,
                      accountAddress
                    ) ||
                      isSameAddress(review.challenger.id, accountAddress) ||
                      isSameAddress(
                        review.proposal.proposer.id,
                        accountAddress
                      )) ? (
                      <span>
                        <Button
                          title="You're the requester, proposer or challenger. You can't review"
                          disabled={true}
                        >
                          Review Challenge
                        </Button>
                      </span>
                    ) : (
                      <Link href={`/reviewer/${review.id}`}>
                        <Button>Review Challenge</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
