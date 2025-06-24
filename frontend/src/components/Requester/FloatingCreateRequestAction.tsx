import { Plus } from "lucide-react";
import { useContext } from "react";
import {
  ActionTypes,
  CreateRequestContext,
} from "../request/CreateRequestProvider";

export const FloatingCreateRequestAction = () => {
  const createRequest = useContext(CreateRequestContext);
  return (
    <button
      disabled={createRequest.state.isModalOpen}
      onClick={() => {
        createRequest.dispatch({ type: ActionTypes.OpenModal });
      }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 z-50"
    >
      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
    </button>
  );
};
