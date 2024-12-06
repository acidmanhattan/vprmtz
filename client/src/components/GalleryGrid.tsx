import { NFT } from "@/lib/types";
import NFTCard from "./NFTCard";

interface GalleryGridProps {
  nfts: NFT[];
}

export default function GalleryGrid({ nfts }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {nfts.map((nft, index) => (
        <NFTCard 
          key={nft.id} 
          nft={nft} 
          nfts={nfts}
          currentIndex={index}
        />
      ))}
    </div>
  );
}
