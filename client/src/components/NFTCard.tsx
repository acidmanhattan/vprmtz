import { NFT } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState, useEffect } from "react";
import NFTDialog from "./NFTDialog";

interface NFTCardProps {
  nft: NFT;
  nfts: NFT[];
  currentIndex: number;
}

export default function NFTCard({ nft, nfts, currentIndex }: NFTCardProps) {
  const [showDialog, setShowDialog] = useState(false);

  const preloadImage = (url: string) => {
    if (!url) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  };

  // Only preload next image when hovering
  const handleHover = () => {
    const nextIndex = currentIndex < nfts.length - 1 ? currentIndex + 1 : 0;
    if (nfts[nextIndex]) preloadImage(nfts[nextIndex].imageUrl);
  };

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary"
        onClick={() => setShowDialog(true)}
        onMouseEnter={handleHover}
      >
        <CardContent className="p-2">
          <AspectRatio ratio={1}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-muted animate-pulse" />
              <img
                src={nft.imageUrl}
                alt={nft.title}
                className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.opacity = '1';
                }}
                style={{ opacity: 0 }}
              />
            </div>
          </AspectRatio>
          <div className="mt-2">
            <h3 className="font-mono text-sm font-bold uppercase text-center">{nft.title}</h3>
          </div>
        </CardContent>
      </Card>

      <NFTDialog
        nft={nft}
        nfts={nfts}
        open={showDialog}
        onOpenChange={(open) => setShowDialog(open)}
      />
    </>
  );
}