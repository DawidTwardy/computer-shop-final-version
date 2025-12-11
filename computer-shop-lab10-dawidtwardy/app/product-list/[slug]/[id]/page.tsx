'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProductById, addToCart } from '@/lib/api';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  amount: number;
  image?: string;
  description?: string;
  type?: string;
  category?: { id: number; name: string };
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        if (!data) {
          setError('Produkt nie znaleziony');
        } else {
          setProduct(data);
        }
      } catch (err) {
        setError('Błąd podczas ładowania produktu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(1, productId, quantity);
      alert(`Dodano ${quantity} szt. do koszyka!`);
      router.push('/basket');
    } catch (err) {
      alert('Błąd przy dodawaniu do koszyka');
    }
  };

  if (loading) return <div style={{ padding: '20px', fontSize: '18px' }}>⏳ Ładowanie...</div>;
  if (error || !product) return <div style={{ padding: '20px', fontSize: '18px', color: 'red' }}>❌ {error}</div>;

  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/product-list" style={{ color: '#0066cc', textDecoration: 'underline', marginBottom: '20px', display: 'inline-block' }}>
        ← Powrót do listy produktów
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        {/* Obraz */}
        <div>
          {product.image && (
            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <Image
                src={`/${product.image}`}
                alt={product.name}
                width={400}
                height={400}
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
            </div>
          )}
        </div>

        {/* Szczegóły */}
        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          
          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p><strong>Kod produktu:</strong> {product.code}</p>
            <p><strong>Typ:</strong> {product.type}</p>
            {product.category && (
              <p><strong>Kategoria:</strong> {product.category.name}</p>
            )}
          </div>

          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '24px', margin: '0', fontWeight: 'bold' }}>
              Cena: {product.price.toFixed(2)} zł
            </p>
          </div>

          {product.description && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Opis:</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '16px' }}>
              <strong>
                {product.amount > 0 ? `Na stanie: ${product.amount} szt.` : 'Brak na stanie'}
              </strong>
            </p>
          </div>

          {product.amount > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ marginRight: '10px' }}>
                <strong>Ilość:</strong>
              </label>
              <input
                type="number"
                min="1"
                max={product.amount}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '80px',
                  fontSize: '16px',
                }}
              />
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.amount <= 0}
            style={{
              padding: '12px 24px',
              backgroundColor: product.amount > 0 ? '#bcbcb7' : '#999',
              color: '#181817',
              border: 'none',
              borderRadius: '4px',
              cursor: product.amount > 0 ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '16px',
              width: '100%',
              opacity: product.amount > 0 ? 1 : 0.6,
            }}
          >
            {product.amount > 0 ? '🛒 Dodaj do koszyka' : 'Brak na stanie'}
          </button>
        </div>
      </div>
    </main>
  );
}
