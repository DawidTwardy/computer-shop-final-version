import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const pkLink = "https://mechan.pk.edu.pl/"; 

    return (
        <footer className="text-center p-4 text-[#e5e5e1] mt-8">
            <p className="m-0">&copy; {currentYear} Dawid Twardy. Wszelkie prawa zastrzeżone.</p>
            <p className="m-0">
                Projekt dla <a href={pkLink} target="_blank" rel="noopener noreferrer" className="text-[#e5e5e1] underline hover:text-[#bcbcb7]">Wydziału Mechanicznego Politechniki Krakowskiej</a>
            </p>
        </footer>
    );
}