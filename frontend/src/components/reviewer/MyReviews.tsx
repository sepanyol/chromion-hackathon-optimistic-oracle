// components/MyActiveChallenges.tsx
"use client";
import { MyReviewsType } from "@/types/Requests";
import { AlertCircle } from "lucide-react";
import { RequestStatusBadge } from "../RequestStatusBadge";
import { ShortAddress } from "../utilities/ShortAddress";
import { ReviewBar } from "./ReviewBar";

type MyReviewsProps = {
  reviews: MyReviewsType[];
};
export const MyReviews = ({ reviews }: MyReviewsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">My Reviews</h3>
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
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-1 text-gray-900 items-center">
                    <RequestStatusBadge status={review.request.status} />
                    <span className="font-bold">Q:</span>
                    <span>{review.request.question}</span>
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
                        address={review.challenge.challenger.id}
                      />
                    </div>
                    <div className="flex flex-col col-span-4 md:col-span-2">
                      <span className="text-sm text-gray-500 mb-2">
                        Reviews
                      </span>
                      <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                        <ReviewBar
                          showWinner={review.request.status === 4}
                          challengeVotes={review.challenge.votesFor}
                          proposalVotes={review.challenge.votesAgainst}
                          votedForChallenger={review.supportsChallenge}
                        />
                      </div>
                    </div>
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
