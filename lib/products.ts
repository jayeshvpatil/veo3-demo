import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  image: string;
  title: string;
  description: string;
}

export function getProductsFromCSV(): Product[] {
  const csvPath = path.join(process.cwd(), 'mk.csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const lines = csv.split('\n');
  const header = lines[0].split(',');
  const idIdx = header.indexOf('id');
  const imageIdx = header.indexOf('image_link');
  const titleIdx = header.indexOf('title');
  const descIdx = header.indexOf('description');

  const products: Product[] = [];
  for (let i = 1; i < Math.min(lines.length, 101); i++) {
    const row = lines[i].split(',');
    if (row.length < Math.max(idIdx, imageIdx, titleIdx, descIdx)) continue;
    products.push({
      id: row[idIdx],
      image: row[imageIdx],
      title: row[titleIdx],
      description: row[descIdx],
    });
  }
  return products;
}
