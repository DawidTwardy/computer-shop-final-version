"use client"

import { useState, useTransition } from "react"
import { addToCart } from "@/lib/actions/cart"

interface AddToCartButtonProps {
  productId: number
  price: number
  productName: string
}

export default function AddToCartButton({ productId, price, productName }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")

  const handleAddToCart = () => {
    setMessage("")
    startTransition(async () => {
      try {
        const result = await addToCart(productId, 1) // Dodajemy 1 sztukę
        if (result.success) {
          setMessage("✅ Dodano!")
          // Opcjonalnie: ukryj komunikat po 2 sekundach
          setTimeout(() => setMessage(""), 2000)
        } else {
          setMessage("❌ " + result.message)
        }
      } catch (error) {
        setMessage("❌ Błąd serwera")
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleAddToCart}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Dodawanie..." : `Dodaj do koszyka (${price} zł)`}
      </button>
      
      {message && (
        <p className="text-sm font-medium text-gray-700">{message}</p>
      )}
    </div>
  )
}