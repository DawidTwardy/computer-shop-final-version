"use client";

import { removeItemFromCart } from "@/lib/actions/cart";
import { useTransition } from "react";
import styles from "./page.module.css";

export default function RemoveButton({ productId }: { productId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (!confirm("Usunąć produkt?")) return;
    startTransition(async () => {
      await removeItemFromCart(productId);
    });
  };

  return (
    <button 
      onClick={handleRemove} 
      disabled={isPending}
      className={styles.removeBtn}
    >
      {isPending ? "..." : "Usuń"}
    </button>
  );
}