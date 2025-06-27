import { isBoolean } from "lodash";

type ReviewBarType = {
  proposalVotes: number;
  challengeVotes: number;
  showWinner?: boolean;
  votedForChallenger?: boolean;
};
export const ReviewBar = ({
  showWinner = false,
  challengeVotes,
  proposalVotes,
  votedForChallenger,
}: ReviewBarType) => {
  const total = Number(challengeVotes) + Number(proposalVotes);
  const shareLeft = challengeVotes / total;
  return (
    <div className="flex flex-col gap-1">
      {isBoolean(votedForChallenger) && (
        <div>
          You voted for {votedForChallenger ? " challenger" : " proposer"}
        </div>
      )}

      {showWinner ? (
        <span className="uppercase text-gray-800 font-bold">
          {challengeVotes > proposalVotes ? "Challenger" : "Proposer"} won&nbsp;
          🥳
        </span>
      ) : (
        <>
          <div className="flex rounded-lg relative text-sm px-2">
            <span className="text-gray-600 flex-1">Challenger</span>
            <span className="text-gray-600">Proposer</span>
          </div>
          <div className="bg-blue-200 h-6 flex rounded-lg overflow-auto relative">
            <div
              className="h-6 bg-purple-200 border-r border-r-black/30"
              style={{ width: `calc(100% * ${shareLeft})` }}
            ></div>
            <div className="inset-0 absolute flex text-sm items-center px-2">
              <span className="text-blue-900/80 flex-1">
                {challengeVotes} supporter{challengeVotes != 1 && "s"}
              </span>
              <span className="text-blue-900/60 ">
                {proposalVotes} supporter{proposalVotes != 1 && "s"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
