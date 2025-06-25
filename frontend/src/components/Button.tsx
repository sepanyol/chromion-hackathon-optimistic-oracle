import clsx from "clsx";
import React, { forwardRef, PropsWithChildren } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, _) => {
  return (
    <button
      {...props}
      className={clsx([
        `flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`,
        props.className,
      ])}
    >
      {props.children}
    </button>
  );
});
