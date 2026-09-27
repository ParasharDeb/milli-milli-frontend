"use client";

import { createContext, useContext } from "react";

/**
 * Lets an "Add to order" button inside the chat tell the conversation what it
 * just added, so the assistant can ask its one "bread or rice with that?".
 * Outside the chat nothing listens, and the default does nothing.
 */
export const AfterAddContext = createContext<(itemIds: string[]) => void>(() => {});

export function useAfterAdd() {
  return useContext(AfterAddContext);
}
