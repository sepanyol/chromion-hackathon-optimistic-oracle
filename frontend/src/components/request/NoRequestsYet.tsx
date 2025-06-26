import { Clock, Plus } from "lucide-react";
import { useContext } from "react";
import { Button } from "../Button";
import { ActionTypes, CreateRequestContext } from "./CreateRequestProvider";

export const NoRequestsYet = () => {
  const createRequest = useContext(CreateRequestContext);
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <div className="text-gray-400 mb-4">
        <Clock className="w-12 h-12 mx-auto" />
      </div>
      <p className="text-gray-500 text-lg mb-4">
        We can't find any requests just yet
      </p>
      <p className="flex justify-center">
        <div>
          <Button
            onClick={() => {
              createRequest.dispatch({ type: ActionTypes.OpenModal });
            }}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Request</span>
          </Button>
        </div>
      </p>
    </div>
  );
};
