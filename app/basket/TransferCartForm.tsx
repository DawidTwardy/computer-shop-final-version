"use client"

import { useState, useTransition } from "react"
import { transferCart } from "@/lib/actions/cart"
import styles from "./page.module.css"

interface UserWithCart {
  id: string
  name: string | null
  email: string | null
  cart: { _count: { items: number } } | null
}

export default function TransferCartForm({ users, currentUserId }: { users: UserWithCart[], currentUserId: string }) {
  const [fromUser, setFromUser] = useState(currentUserId)
  const [toUser, setToUser] = useState("")
  const [isPending, startTransition] = useTransition();

  const handleTransfer = () => {
    if (!toUser) return alert("Wybierz użytkownika docelowego")
    
    startTransition(async () => {
      try {
        const res = await transferCart(fromUser, toUser)
        if(res.success) {
            alert("Przeniesiono pomyślnie!")
            // window.location.reload() nie jest potrzebne, bo Server Action odświeży dane
        } else {
            alert("Błąd: " + res.message || "Nieznany błąd")
        }
      } catch (e) {
        alert("Błąd transferu")
      }
    })
  }

  return (
    <div className={styles.transferSection}>
      <h3 className={styles.transferHeader}>Transfer koszyka (Admin Panel)</h3>
      <div className={styles.transferForm}>
        <div style={{flex: 1}}>
          <label className="block text-sm font-medium mb-1" style={{color: '#bcbcb7'}}>Z konta:</label>
          <select 
            className={styles.userSelect}
            value={fromUser}
            onChange={(e) => setFromUser(e.target.value)}
            disabled={isPending}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.email || "Bez emaila"} (Prod: {u.cart?._count.items || 0})
              </option>
            ))}
          </select>
        </div>
        
        <div style={{flex: 1}}>
          <label className="block text-sm font-medium mb-1" style={{color: '#bcbcb7'}}>Na konto:</label>
          <select 
            className={styles.userSelect}
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
            disabled={isPending}
          >
            <option value="">-- Wybierz użytkownika --</option>
            {users.map(u => (
              <option key={u.id} value={u.id} disabled={u.id === fromUser}>
                {u.email || u.name || "Użytkownik " + u.id.slice(0,5)}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleTransfer}
          disabled={isPending || !toUser}
          className={styles.transferBtn}
          style={{marginTop: '20px'}}
        >
          {isPending ? "Przenoszenie..." : "Przenieś koszyk"}
        </button>
      </div>
    </div>
  )
}