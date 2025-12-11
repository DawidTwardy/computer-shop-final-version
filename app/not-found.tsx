import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="text-center p-12 mt-12 border-2 border-[#bcbcb7] rounded-lg bg-white/5 mx-auto max-w-lg">
            <h1 className="text-3xl text-[#e5e5e1] mb-4">Nie znaleziono strony</h1>
            <p className="mb-4">Strona, której szukasz, nie istnieje.</p>
            <p>
                Sprawdź adres URL lub <Link href="/" className="text-[#e5e5e1] underline font-bold hover:text-[#bcbcb7] transition-colors">wróć na stronę główną</Link>.
            </p>
        </main>
    );
}