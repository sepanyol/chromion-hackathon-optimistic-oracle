import React, { Dispatch } from "react";

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export const createContext = <S, A>(initialState: S) =>
  React.createContext<{
    state: S;
    dispatch: Dispatch<A>;
  }>({
    state: initialState,
    dispatch: () => null,
  });
