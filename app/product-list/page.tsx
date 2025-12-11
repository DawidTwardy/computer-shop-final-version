import Link from "next/link";
import { prisma } from "@/lib/db";

// Uwaga: Komponent Next.js 14 Server Component

export default async function ProductListPage() {
  
  // Zastąpienie starych fetchCategories nowym pobieraniem z bazy
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' }
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Lista Produktów</h1>

      {/* Sekcja Kategorii (prawdopodobnie używasz jej do nawigacji) */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/product-list" className="px-4 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200 transition">
          Wszystkie ({products.length})
        </Link>
        {categories.map(category => (
          <Link 
            key={category.id} 
            href={`/product-list?category=${category.id}`} 
            className="px-4 py-2 border rounded text-sm bg-gray-100 hover:bg-gray-200 transition"
          >
            {category.name} ({category._count.products})
          </Link>
        ))}
      </div>

      {/* Lista Produktów */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white p-4 shadow-lg rounded-lg flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{product.category.name}</p>
              <p className="text-gray-700 mb-4">{product.description?.substring(0, 100)}...</p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-green-600 mb-3">{product.price.toFixed(2)} zł</p>
              <button 
                // UWAGA: Logika dodawania do koszyka wymaga Client Component,
                // musisz ją zaimplementować w osobnym komponencie np. <AddToCartButton productId={product.id} />
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              >
                Dodaj do koszyka
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
