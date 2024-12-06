import type { NFTsResponse } from "./types";

const PAGE_SIZE = 20;

export async function fetchNFTs({ pageParam = 1 }): Promise<NFTsResponse> {
  const response = await fetch(`/api/nfts?page=${pageParam}&limit=${PAGE_SIZE}`);
  if (!response.ok) {
    throw new Error("Failed to fetch NFTs");
  }
  const data = await response.json();
  return {
    items: data.items,
    hasMore: data.hasMore
  };
}
