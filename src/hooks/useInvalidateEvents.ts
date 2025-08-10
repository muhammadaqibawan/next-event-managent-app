import { useQueryClient } from "@tanstack/react-query";

export function useInvalidateEvents() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };
}
