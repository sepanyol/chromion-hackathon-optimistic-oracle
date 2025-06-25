import clsx from "clsx";
import { PropsWithChildren } from "react";

type ColoredTileProps = {
  color?: "green" | "red" | "default";
} & PropsWithChildren;

export const ColoredTile = ({
  color = "default",
  children,
}: ColoredTileProps) => {
  return (
    <div
      className={clsx([
        `p-4 border rounded-lg`,
        color == "green" && "border-green-300 bg-green-100 text-green-950/50",
        color == "red" && "border-red-300 bg-red-100 text-red-950/50",
        color == "default" && "border-gray-300 bg-gray-100 text-gray-950/50",
      ])}
    >
      {children}
    </div>
  );
};
