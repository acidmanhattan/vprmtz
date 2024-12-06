import type { Express } from "express";
import { fetchMetadata } from './utils/csv';
import { getSignedImageUrl } from './utils/r2';

export function registerRoutes(app: Express) {
  app.get("/api/nfts", async (req, res) => {
    try {
      const metadata = await fetchMetadata();
      console.log('Metadata sample:', metadata.slice(0, 2));
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      const pageItems = metadata.slice(start, end);
      const signedUrlPromises = pageItems.map(async item => {
        if (!item.imageUrl) return item;
        
        try {
          const signedUrl = await getSignedImageUrl(item.imageUrl);
          return {
            ...item,
            imageUrl: signedUrl
          };
        } catch (error) {
          console.error(`Failed to get signed URL for ${item.imageUrl}:`, error);
          // Fallback to direct URL if signing fails
          return {
            ...item,
            imageUrl: `https://vprmtz.acidmanhattan.xyz/images/${item.imageUrl}`
          };
        }
      });

      const items = await Promise.all(signedUrlPromises);
      const hasMore = end < metadata.length;
      res.json({ items, hasMore });
    } catch (error) {
      console.error("Error in /api/nfts:", error);
      res.status(500).json({ 
        error: "Failed to fetch NFTs",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
