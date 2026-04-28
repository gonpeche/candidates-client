import { API_BASE_URL } from "@/constants/api";
import type { ColumnVisibilityMap } from "@/types";

export async function fetchColumns(): Promise<ColumnVisibilityMap> {
  const res = await fetch(`${API_BASE_URL}/columns`);
  if (!res.ok) throw new Error("Failed to fetch columns");
  return res.json();
}

export async function updateColumns(payload: ColumnVisibilityMap): Promise<ColumnVisibilityMap> {
  const res = await fetch(`${API_BASE_URL}/columns`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update columns");
  return res.json();
}
