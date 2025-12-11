"use client";

import { useState, useTransition } from "react";
import { placeOrder } from "@/lib/actions/cart"; // Poprawiony import
import styles from "./page.module.css";

interface PlaceOrderButtonProps {
  userId: string;
}

export default function PlaceOrderButton({ userId }: PlaceOrderButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handlePlaceOrder = () => {
    if (!confirm("Czy na pewno chcesz złożyć zamówienie?")) return;

    startTransition(async () => {
      try {
        const res = await placeOrder(userId);
        if(res.success) alert("Zamówienie zostało złożone pomyślnie!");
        else alert("Błąd: " + res.message);
      } catch (error) {
        alert("Wystąpił błąd podczas składania zamówienia.");
      }
    });
  };

  return (
    <button
      onClick={handlePlaceOrder}
      disabled={isPending}
      className={styles.checkoutBtn}
    >
      {isPending ? "Przetwarzanie..." : "Złóż zamówienie"}
    </button>
  );
}