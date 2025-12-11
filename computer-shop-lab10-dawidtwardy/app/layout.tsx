// app/layout.tsx
import './global.css';
import { Inter } from 'next/font/google';
import React from 'react';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pl">
            {/* Dodajemy klasy bazowe Tailwind na body */}
            <body className={`${inter.className} bg-[#8989e0] text-[#e5e5e1]`}>
                {/* Zastępujemy .main-container stylami Tailwind */}
                <div className="w-[90%] max-w-6xl mx-auto my-8 min-h-screen flex flex-col p-0">
                    <MainHeader />
                    <main className="flex-grow p-5 md:p-10">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}