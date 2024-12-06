import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchNFTs } from "@/lib/api";
import GalleryGrid from "@/components/GalleryGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function Gallery() {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ["nfts"],
    queryFn: fetchNFTs,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allNFTs = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-sans text-4xl font-black tracking-tighter uppercase">
          VPRMTZ
        </h1>
        <a
          href="https://foundation.app/collection/vprmtz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center rounded-sm border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Mint Now
        </a>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full" />
          ))}
        </div>
      ) : (
        <>
          {allNFTs.length > 0 ? (
            <GalleryGrid nfts={allNFTs} />
          ) : (
            <div className="flex h-[50vh] items-center justify-center">
              <p className="text-lg text-muted-foreground">No NFTs found</p>
            </div>
          )}
          
          <div ref={loadMoreRef} className="h-20 w-full" />
          
          {isFetchingNextPage && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
