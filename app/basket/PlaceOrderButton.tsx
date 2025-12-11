"use client";

import { useState } from "react";
import { placeOrder } from "@/lib/actions/cart";

interface PlaceOrderButtonProps {
  userId: string;
}

export default function PlaceOrderButton({ userId }: PlaceOrderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!confirm("Czy na pewno chcesz złożyć zamówienie?")) return;

    setLoading(true);
    try {
      const res = await placeOrder(userId); 
      
      if (res.success) {
        alert(res.message);
      } else {
        alert(`Błąd: ${res.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd podczas składania zamówienia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePlaceOrder}
      disabled={loading}
      className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Przetwarzanie..." : "Złóż zamówienie"}
    </button>
  );
}
