// lab12/computer-shop-lab10-dawidtwardy/app/product-list/@discounts/default.tsx

import Image from 'next/image';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api'; // Używamy API do pobierania danych
import { slugifyCategoryName } from '@/lib/products'; 

// Interfejs zgodny z danymi zwracanymi przez API
interface Product {
    id: number;
    name: string;
    code: string;
    type: string;
    price: number;
    amount: number;
    image: string;
    category: {
        name: string; // Używane do generowania sluga
    };
}

/**
 * Funkcja wybiera N losowych produktów dostępnych na stanie.
 */
function getRandomProducts(products: Product[], n: number): Product[] {
    // Filtrujemy tylko produkty dostępne na stanie
    const productsInStock = products.filter(p => p.amount > 0);
    
    if (productsInStock.length <= n) {
        return productsInStock;
    }

    // Losowe tasowanie i wybór N elementów
    const shuffled = [...productsInStock].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

export default async function DiscountsDefault() {
    let allProducts: Product[] = [];
    let fetchError = false;

    try {
        // Logowanie debugowe do konsoli Next.js
        console.log("DEBUG: Attempting to fetch products for @discounts slot.");
        allProducts = await fetchProducts();
        if (allProducts.length === 0) {
            console.warn("WARN: Fetch was successful, but no products were returned from API.");
        }
    } catch (e) {
        // Krytyczne logowanie błędu, jeśli pobieranie zawiedzie
        console.error("FATAL ERROR: Failed to fetch products for Discounts component.", e);
        fetchError = true;
    }
    
    if (fetchError) {
        // Wyświetlenie komunikatu błędu w widoku, jeśli pobieranie się nie powiedzie
        return (
            <div className="p-4 bg-red-600/70 text-white rounded-lg">
                ❌ Błąd krytyczny: Nie można załadować promocji (Błąd API).
            </div>
        );
    }

    const discountedProducts = getRandomProducts(allProducts, 3);
    const productsInStock = allProducts.filter(p => p.amount > 0);

    return (
        <div className="p-4 bg-white/10 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-yellow-400">Promocje Dnia (-10%)</h3>
            <div className="flex flex-col gap-4">
                {discountedProducts.map((p) => {
                    const originalPrice = p.price;
                    const discountedPrice = originalPrice * 0.9;
                    
                    // GENEROWANIE POPRAWNEGO SLUGA
                    const categorySlug = slugifyCategoryName(p.category.name);

                    return (
                        <Link 
                            key={p.id} 
                            // POPRAWIONY LINK: /product-list/[slug]/[id]
                            href={`/product-list/${categorySlug}/${p.id}`} 
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-md hover:bg-white/10 transition-colors"
                        >
                            <div className="flex-shrink-0 w-12 h-12 relative">
                                <Image 
                                    src={`/images/products/${p.image}`} 
                                    alt={p.name} 
                                    fill 
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-sm truncate">{p.name}</p>
                                <div className="flex items-center text-sm">
                                    <span className="line-through mr-2 text-red-400">{originalPrice.toFixed(2)} zł</span>
                                    <span className="font-bold text-green-400">{discountedPrice.toFixed(2)} zł</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
            {productsInStock.length === 0 && (
                <p className="text-center text-gray-400 mt-4">Brak produktów na stanie, brak promocji.</p>
            )}
            {discountedProducts.length === 0 && productsInStock.length > 0 && (
                <p className="text-center text-gray-400 mt-4">Nie wybrano żadnych produktów do promocji.</p>
            )}
        </div>
    );
}