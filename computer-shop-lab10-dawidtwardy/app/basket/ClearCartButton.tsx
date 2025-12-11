"use client";

import { clearCart } from "@/lib/actions/cart"; // Poprawiony import (z @)
import styles from "./page.module.css";
import { useTransition } from "react";

interface ClearCartButtonProps {
  userId: string;
}

export default function ClearCartButton({ userId }: ClearCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClear = () => {
    if (confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
      startTransition(async () => {
        await clearCart(userId);
      });
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={isPending}
      className={styles.clearBtn}
    >
      {isPending ? "Czyszczenie..." : "Wyczyść koszyk"}
    </button>
  );
}