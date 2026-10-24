import heroJewelryImage from './images/hero_luxury_gold_jewelry_1792823129847.jpg';
import goldNecklaceImage from './images/product_gold_necklace_1792823131025.jpg';
import silverCuffImage from './images/product_silver_cuff_1792823130893.jpg';
import weddingRingsImage from './images/product_wedding_rings_1792823132120.jpg';
import craftsmanshipImage from './images/craftsmanship_artisan_workbench_1792823131791.jpg';

const bundledImageUrls: Record<string, string> = {
  '/src/assets/images/hero_luxury_gold_jewelry_1792823129847.jpg': heroJewelryImage,
  '/src/assets/images/product_gold_necklace_1792823131025.jpg': goldNecklaceImage,
  '/src/assets/images/product_silver_cuff_1792823130893.jpg': silverCuffImage,
  '/src/assets/images/product_wedding_rings_1792823132120.jpg': weddingRingsImage,
  '/src/assets/images/craftsmanship_artisan_workbench_1792823131791.jpg': craftsmanshipImage,
};

export function resolveBundledImageUrl(url: string): string {
  return bundledImageUrls[url] ?? url;
}

export {
  craftsmanshipImage,
  goldNecklaceImage,
  heroJewelryImage,
  silverCuffImage,
  weddingRingsImage,
};
