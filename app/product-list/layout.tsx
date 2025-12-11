import React from 'react';

// Layout musi przyjmować sloty równoległe jako propsy.
export default function ProductListLayout({
  children, // Slot domyślny (page.tsx)
  discounts, // Slot równoległy @discounts
}: {
  children: React.ReactNode;
  discounts: React.ReactNode;
}) {
  return (
    // Użycie klas Tailwind do ułożenia zawartości (lista + promocje) w dwóch kolumnach.
    <div className="flex container mx-auto px-4 py-8 gap-8">
      {/* Kolumna główna dla listy produktów (children) - zajmuje 3/4 szerokości na dużych ekranach */}
      <div className="w-full lg:w-3/4">
        {children}
      </div>
      
      {/* Kolumna dla promocji (@discounts) - widoczna tylko na dużych ekranach (lg), zajmuje 1/4 szerokości */}
      <div className="hidden lg:block lg:w-1/4">
        {discounts}
      </div>
    </div>
  );
}