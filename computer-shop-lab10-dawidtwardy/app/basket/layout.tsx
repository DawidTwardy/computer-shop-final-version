import React from 'react';

export default function BasketLayout({ children }: { children: React.ReactNode }) {
    return (
        <section>
            {children}
        </section>
    );
}