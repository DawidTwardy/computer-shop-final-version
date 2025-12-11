// lab12/computer-shop-lab10-dawidtwardy/lib/products.ts

// Usunięto importy fs i path, ponieważ dane są teraz pobierane przez API
// import fs from 'fs';
// import path from 'path';

export interface Product {
    id: number;
    code: string;
    name: string;
    type: 'procesor' | 'karta graficzna' | 'pamięć ram' | 'dysk';
    price: number;
    amount: number;
    description: string;
    image: string;
    // Dodano pole category, niezbędne do poprawnego routingu z API
    category?: {
        id: number;
        name: string;
    }
}

/**
 * Konwertuje nazwę kategorii/typu produktu na "slug" URL.
 * Zamienia spacje na myślniki i usuwa polskie znaki diakrytyczne.
 */
export function slugifyCategoryName(name: string): string {
  // 1. Zamiana na małe litery
  let slug = name.toLowerCase();

  // 2. Prosta zamiana polskich znaków na odpowiedniki bez diakrytyków
  slug = slug.replace(/ą/g, 'a')
             .replace(/ć/g, 'c')
             .replace(/ę/g, 'e')
             .replace(/ł/g, 'l')
             .replace(/ń/g, 'n')
             .replace(/ó/g, 'o')
             .replace(/ś/g, 's')
             .replace(/ż/g, 'z')
             .replace(/ź/g, 'z');

  // 3. Zamiana spacji i innych znaków na myślniki
  slug = slug.replace(/[^a-z0-9 -]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-');

  return slug;
}