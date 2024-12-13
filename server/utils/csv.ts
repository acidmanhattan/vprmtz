import { parse } from 'csv-parse/sync';
import fetch from 'node-fetch';

interface CSVRecord {
  image: string;  // Changed from Image to match CSV
  title: string;  // Changed from Title
  description: string;  // Changed from Description
  Activity: string;
  Relationship: string;
  Artwork: string;
  Domain: string;
  Material: string;
  Metaphor: string;
  Object: string;
  Observe: string;
  Symbol: string;
}

export async function fetchMetadata() {
  try {
    const response = await fetch('https://vprmtz.acidmanhattan.xyz/metadata/vprmtz-metadata.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    console.log('Raw CSV data first few lines:', csvData.split('\n').slice(0, 3));
    
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      trim: true,
      quote: '"',
      escape: '"',
      relax_quotes: true,
      from_line: 1  // Start from first line
    }) as CSVRecord[];
    
    // Add debug logging
    console.log('First record raw:', records[0]);
    console.log('First record mapped:', {
      imageUrl: records[0].image,
      title: records[0].title,
      description: records[0].description
    });
    
    // Sort records based on filename numbers, with error handling
    const sortedRecords = [...records].sort((a, b) => {
      // Handle potential undefined values
      if (!a.image || !b.image) return 0;
      
      // Extract numbers from filenames safely
      const aMatch = a.image.match(/^(\d+)/);
      const bMatch = b.image.match(/^(\d+)/);
      const aNum = aMatch ? parseInt(aMatch[1]) : 0;
      const bNum = bMatch ? parseInt(bMatch[1]) : 0;
      
      return aNum - bNum;
    });
    
    return sortedRecords.map((record, index) => ({
      id: index + 1,
      imageUrl: record.image?.trim(),  // Changed from Image to image
      title: record.title?.trim(),     // Changed from Title to title
      description: record.description?.trim(), // Changed from Description to description
      metadata: {
        activity: record.Activity?.trim() || '',
        relationship: record.Relationship?.trim() || '',
        artwork: record.Artwork?.trim() || '',
        domain: record.Domain?.trim() || '',
        material: record.Material?.trim() || '',
        metaphor: record.Metaphor?.trim() || '',
        object: record.Object?.trim() || '',
        observe: record.Observe?.trim() || '',
        symbol: record.Symbol?.trim() || ''
      }
    }));
  } catch (error) {
    console.error('Error in fetchMetadata:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : '');
    throw error;
  }
}
