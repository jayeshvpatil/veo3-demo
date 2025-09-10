import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
  gender: string;
  availability: string;
  age_group: string;
  brand: string;
  best_seller: boolean;
  category: string;
}

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'mk.csv');
    const csv = fs.readFileSync(csvPath, 'utf8');
    const lines = csv.split('\n');
    
    // Parse CSV properly handling quotes
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }
    
    const header = parseCSVLine(lines[0]);
    const idIdx = header.indexOf('id');
    const imageIdx = header.indexOf('image_link');
    const titleIdx = header.indexOf('title');
    const descIdx = header.indexOf('description');
    const genderIdx = header.indexOf('gender');
    const availabilityIdx = header.indexOf('availability');
    const ageGroupIdx = header.indexOf('age_group');
    const brandIdx = header.indexOf('brand');
    const bestSellerIdx = header.indexOf('best_seller_label');
    const productTypeIdx = header.indexOf('product_type');

    // Helper function to extract main category from product_type
    function extractCategory(productType: string): string {
      if (!productType) return 'other';
      
      const parts = productType.split(' > ');
      if (parts.length < 2) return 'other';
      
      const mainCategory = parts[1].toLowerCase();
      
      // Map to simplified categories
      if (mainCategory.includes('shoes') || mainCategory.includes('trainers') || mainCategory.includes('sandals') || mainCategory.includes('boots')) {
        return 'shoes';
      } else if (mainCategory.includes('bags') || mainCategory.includes('wallets') || mainCategory.includes('handbags')) {
        return 'bags';
      } else if (mainCategory.includes('apparel') || mainCategory.includes('clothing')) {
        return 'apparel';
      } else if (mainCategory.includes('watches')) {
        return 'watches';
      } else if (mainCategory.includes('jewelry')) {
        return 'jewelry';
      } else {
        return 'accessories';
      }
    }

    const products: Product[] = [];
    for (let i = 1; i < Math.min(lines.length, 201); i++) { // Increased to 200 products
      const line = lines[i];
      if (!line.trim()) continue;
      
      const row = parseCSVLine(line);
      if (row.length <= Math.max(idIdx, imageIdx, titleIdx, descIdx)) continue;
      
      const imageUrl = row[imageIdx] || '';
      const title = row[titleIdx] || '';
      
      if (!imageUrl.startsWith('http') || !title) continue;
      
      products.push({
        id: row[idIdx] || '',
        image: imageUrl,
        title: title,
        description: row[descIdx] || '',
        gender: row[genderIdx] || '',
        availability: row[availabilityIdx] || '',
        age_group: row[ageGroupIdx] || '',
        brand: row[brandIdx] || '',
        best_seller: (row[bestSellerIdx] || '').toLowerCase().includes('best'),
        category: extractCategory(row[productTypeIdx] || ''),
      });
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    
    // Return fallback products if CSV fails to load
    const fallbackProducts: Product[] = [
      {
        id: "fallback-1",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
        title: "Sample Nike Sneaker",
        description: "High-quality athletic footwear with modern design and comfort technology.",
        gender: "unisex",
        availability: "in stock",
        age_group: "adult",
        brand: "Nike",
        best_seller: true,
        category: "shoes"
      },
      {
        id: "fallback-2", 
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
        title: "Designer Handbag",
        description: "Elegant leather handbag perfect for professional and casual settings.",
        gender: "female",
        availability: "in stock",
        age_group: "adult", 
        brand: "Sample Brand",
        best_seller: false,
        category: "bags"
      },
      {
        id: "fallback-3",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
        title: "Classic Watch",
        description: "Timeless timepiece with precision movement and elegant design.",
        gender: "unisex",
        availability: "in stock",
        age_group: "adult",
        brand: "Sample Watch Co",
        best_seller: true,
        category: "watches"
      }
    ];
    
    console.log('Using fallback products due to CSV error');
    return NextResponse.json(fallbackProducts);
  }
}
