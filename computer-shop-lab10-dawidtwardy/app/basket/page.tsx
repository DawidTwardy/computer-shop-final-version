import { auth } from "@/lib/auth"
import { getCartWithItems, getCartTotal, getAllUsersWithCarts } from "@/lib/actions/cart"
import { SignIn, SignOut } from "@/components/auth-components"
import Link from "next/link"
import Image from "next/image"
import ClearCartButton from "./ClearCartButton"
import PlaceOrderButton from "./PlaceOrderButton"
import TransferCartForm from "./TransferCartForm"
import styles from "./page.module.css"


import RemoveButton from "./RemoveButton"

export default async function BasketPage() {
  const session = await auth()
  const userId = session?.user?.id

  // 1. Brak logowania
  if (!userId) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h1 className={styles.title}>Wymagane logowanie</h1>
          <p style={{ marginBottom: 20 }}>Musisz się zalogować, aby zobaczyć swój koszyk.</p>
          <div style={{ display: 'inline-block' }}>
             <SignIn provider="github" />
          </div>
        </div>
      </div>
    )
  }

  // 2. Pobieranie danych
  const [cart, totalAmount, allUsers] = await Promise.all([
    getCartWithItems(userId),
    getCartTotal(userId),
    getAllUsersWithCarts()
  ])

  // 3. Pusty koszyk
  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.userHeader}>
          <div>
            <span style={{color: '#bcbcb7', fontSize: '0.9rem'}}>Zalogowany jako: </span>
            <strong>{session.user?.email}</strong>
          </div>
          <SignOut />
        </div>

        <div className={styles.emptyCart}>
          <h2>Twój koszyk jest pusty</h2>
          <p style={{ margin: '20px 0' }}>Nie dodałeś jeszcze żadnych produktów.</p>
          <Link href="/product-list" className={styles.checkoutBtn} style={{ textDecoration: 'none' }}>
            Wróć do sklepu
          </Link>
        </div>
        
        {/* Transfer widoczny dla testów nawet przy pustym */}
        <TransferCartForm users={allUsers} currentUserId={userId} />
      </div>
    )
  }

  // 4. Pełny koszyk
  return (
    <div className={styles.container}>
      <div className={styles.userHeader}>
        <div>
          <span style={{color: '#bcbcb7', fontSize: '0.9rem'}}>Zalogowany jako: </span>
          <strong>{session.user?.email}</strong>
        </div>
        <SignOut />
      </div>

      <h1 className={styles.title}>Twój koszyk</h1>

      <ul className={styles.cartList}>
        {cart.items.map((item) => (
          <li key={item.productId} className={styles.cartItem}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <Image 
                src={item.product.image ? `/${item.product.image}` : '/placeholder.png'} 
                alt={item.product.name}
                fill
                className={styles.itemImage}
              />
            </div>
            
            <div className={styles.itemDetails}>
              <h3>{item.product.name}</h3>
              <p className={styles.itemCode}>Kod: {item.product.code || 'BRAK'}</p>
              <p className={styles.itemCode}>Kategoria: {item.product.category?.name}</p>
              <p className={styles.itemPrice}>{item.product.price.toFixed(2)} zł</p>
            </div>

            <div className={styles.itemActions}>
              <span className={styles.quantityBadge}>Ilość: {item.quantity}</span>
              {/* Komponent usuwania */}
              <RemoveButton productId={item.productId} />
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.summary}>
        <ClearCartButton userId={userId} />
        
        <div className={styles.summaryRight}>
          <div className={styles.totalRow}>
            <span>Razem: </span>
            <span className={styles.totalPrice}>{totalAmount.toFixed(2)} zł</span>
          </div>
          <PlaceOrderButton userId={userId} />
        </div>
      </div>

      <TransferCartForm users={allUsers} currentUserId={userId} />
    </div>
  )
}