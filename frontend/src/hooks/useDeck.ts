import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deckApi } from "../api/client";
import type { DeckConfig } from "../types";

export function useDeckConfigs() {
  return useQuery({ queryKey: ["deck", "configs"], queryFn: deckApi.listConfigs });
}

export function useDeck(filename: string | null) {
  return useQuery({
    queryKey: ["deck", filename],
    queryFn: () => deckApi.get(filename!),
    enabled: !!filename,
  });
}

export function useSaveDeck(filename: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DeckConfig) => deckApi.put(filename, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deck", filename] });
    },
  });
}
