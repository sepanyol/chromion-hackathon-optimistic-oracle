import clsx from "clsx";

type RequestStatusBadge = {
  status: number;
};
export const RequestStatusBadge = ({ status }: RequestStatusBadge) => {
  return (
    <div
      className={clsx([
        "px-4 py-1 font-bold  border  rounded-4xl text-xs",
        status === 1 && "bg-blue-100 border-blue-300 text-blue-900/60",
        status === 2 && "bg-purple-100 border-purple-300 text-purple-900/60",
        status === 3 && "bg-red-100 border-red-300 text-red-900/60",
        status === 4 && "bg-green-100 border-green-300 text-green-900/60",
      ])}
    >
      {status === 1 && "Open"}
      {status === 2 && "Proposed"}
      {status === 3 && "Challenged"}
      {status === 4 && "Resolved"}
    </div>
  );
};
