import { LoaderCircle } from "lucide-react";

type LoaderProps = {
  size?: number;
};
export const Loader = ({ size }: LoaderProps) => {
  return (
    <LoaderCircle
      size={size || 24}
      strokeWidth={1}
      className="text-blue-600 animate-spin"
    />
  );
};
