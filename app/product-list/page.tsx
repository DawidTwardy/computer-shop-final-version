'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { addToCart } from '@/lib/actions/cart';
import Image from 'next/image';
import styles from './page.module.css';
import { slugifyCategoryName } from '@/lib/products';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  amount: number;
  image?: string;
  description?: string;
  type?: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setProducts(productsData as Product[]);
        setCategories(categoriesData);
      } catch (err) {
        setError('Nie udało się załadować danych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  const handleAddToCart = (productId: number) => {
    setAddingId(productId);
    
    startTransition(async () => {
      try {
        const result = await addToCart(productId, 1);
        if (result.success) {
          
        } else {
          alert('Błąd: ' + result.message);
        }
      } catch (err) {
        alert('Błąd przy dodawaniu do koszyka');
      } finally {
        setAddingId(null);
      }
    });
  };

  if (loading) return <div className={styles.title}>⏳ Ładowanie produktów...</div>;
  if (error) return <div className={styles.title}>❌ {error}</div>;

  return (
    <main>
      <h2 className={styles.title}>Lista Produktów ({filteredProducts.length})</h2>
      
      <div className={styles.filterSection}>
        <h3 className={styles.filterHeader}>Filtruj po kategorii:</h3>
        <div className={styles.filterButtons}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`${styles.filterBtn} ${selectedCategory === null ? styles.filterBtnActive : ''}`}
          >
            Wszystkie ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.filterBtnActive : ''}`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <p>Brak produktów do wyświetlenia</p>
      ) : (
        <ul className={styles.productListGrid}>
          {filteredProducts.map((p: Product) => {
            const categorySlug = p.category ? slugifyCategoryName(p.category.name) : 'unknown';
            
            const isAddingThisItem = isPending && addingId === p.id;
            const isOutOfStock = p.amount <= 0;

            return (
              <li key={p.id} className={styles.productListItem}>
                <Link href={`/product-list/${categorySlug}/${p.id}`}>
                  {p.image && (
                    <div className={styles.productImageContainer}>
                      <Image 
                        src={`/${p.image}`} 
                        alt={p.name} 
                        width={250} 
                        height={200}
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />
                    </div>
                  )}
                  
                  <h4>{p.name}</h4>
                  <p>Kod: {p.code}</p>
                  <p>Typ: {p.type}</p>
                  <p>Cena: <strong>{p.price.toFixed(2)} zł</strong></p>
                  <p>Ilość na stanie: {p.amount}</p>
                </Link>
                
                <button 
                  onClick={() => handleAddToCart(p.id)}
                  disabled={isOutOfStock || isAddingThisItem}
                  className={styles.addToCartBtn}
                >
                  {isOutOfStock 
                    ? 'Brak na stanie' 
                    : (isAddingThisItem ? 'Dodawanie...' : 'Dodaj do koszyka')}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}