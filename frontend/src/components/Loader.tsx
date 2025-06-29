import clsx from "clsx";
import { LoaderCircle } from "lucide-react";

type LoaderProps = {
  size?: number;
  className?: string;
};
export const Loader = ({ size, className }: LoaderProps) => {
  return (
    <LoaderCircle
      size={size || 24}
      strokeWidth={1}
      className={clsx(["text-blue-600 animate-spin", className])}
    />
  );
};
