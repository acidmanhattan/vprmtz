import { NFT } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";

interface NFTDialogProps {
  nft: NFT;
  nfts: NFT[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NFTDialog({ 
  nft: initialNft,
  nfts,
  open, 
  onOpenChange,
}: NFTDialogProps) {
  const [currentNft, setCurrentNft] = useState<NFT>(initialNft);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handleNext = () => {
    const nextIndex = currentIndex < nfts.length - 1 ? currentIndex + 1 : 0;
    const nextNft = nfts[nextIndex];
    setCurrentIndex(nextIndex);
    setCurrentNft(nextNft);
  };

  const handlePrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : nfts.length - 1;
    const prevNft = nfts[prevIndex];
    setCurrentIndex(prevIndex);
    setCurrentNft(prevNft);
  };

  useEffect(() => {
    if (!initialNft || !nfts.length) return;
    
    const index = nfts.findIndex(n => n.id === initialNft.id);
    if (index !== -1) {
      setCurrentIndex(index);
      setCurrentNft(initialNft);
    }
  }, [initialNft, nfts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrev, handleNext]);

  const description = currentNft.description?.split('\n\nText Prompt Origin:')[0] || '';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content 
          className="fixed inset-0 z-50 flex overflow-hidden bg-background"
        >
          <VisuallyHidden asChild>
            <DialogPrimitive.Title>{currentNft.title}</DialogPrimitive.Title>
          </VisuallyHidden>

          <div className="flex flex-1 w-full h-full overflow-hidden">
            {/* Mobile Navigation - Fixed */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-end w-full p-4 md:hidden z-10 bg-background">
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrev}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <ChevronLeft className="h-6 w-6" />
                  <span className="sr-only">Previous</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="sr-only">Next</span>
                </button>
                <button 
                  onClick={() => onOpenChange(false)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Container - Full height with padding for fixed nav */}
            <div className="w-full h-full overflow-y-auto pt-[60px] md:pt-0">
              <div className="flex w-full flex-col md:flex-row min-h-full">
                {/* Image Section */}
                <div className="relative w-full md:flex-[3] md:min-h-0">
                  <div className="relative w-full pb-[100%] md:pb-0 md:h-full">
                    <div className="absolute inset-0 p-4 md:p-6">
                      <img
                        src={currentNft.imageUrl}
                        alt={currentNft.title}
                        className="h-full w-full object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata Section */}
                <div className="flex flex-col flex-1 min-w-0 w-full md:w-[350px] lg:w-[400px] xl:w-[450px] md:border-l border-border overflow-hidden">
                  {/* Desktop Navigation */}
                  <div className="hidden md:flex items-center justify-end gap-2 p-4 border-b border-border">
                    <button 
                      onClick={handlePrev}
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <ChevronLeft className="h-6 w-6" />
                      <span className="sr-only">Previous</span>
                    </button>
                    <button 
                      onClick={handleNext}
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <ChevronRight className="h-6 w-6" />
                      <span className="sr-only">Next</span>
                    </button>
                    <button 
                      onClick={() => onOpenChange(false)}
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 md:p-6 space-y-6">
                      {/* Title */}
                      <div>
                        <h3 className="font-mono text-sm font-bold uppercase mb-2">TITLE</h3>
                        <p className="font-mono text-sm break-words">{currentNft.title}</p>
                      </div>
                      <Separator />
                      {/* Description */}
                      <div>
                        <h3 className="font-mono text-sm font-bold uppercase mb-2">Description</h3>
                        <p className="font-mono text-sm whitespace-pre-wrap break-words">{description}</p>
                      </div>
                      <Separator />
                      {/* Attributes */}
                      <div className="space-y-2">
                        <h3 className="font-mono text-sm font-bold uppercase mb-2">Attributes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
                          {Object.entries(currentNft.metadata).map(([key, value]) => (
                            value && (
                              <div
                                key={key}
                                className="rounded-sm border border-border p-3 hover:bg-accent transition-colors"
                              >
                                <div className="font-mono text-xs text-muted-foreground uppercase mb-1">
                                  {key}
                                </div>
                                <div className="font-mono text-sm break-words min-h-[1.5rem]">
                                  {String(value)}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
