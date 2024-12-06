export interface NFT {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  metadata: Record<string, any>;
}

export interface NFTsResponse {
  items: NFT[];
  hasMore: boolean;
}
