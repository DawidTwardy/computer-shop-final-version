import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] items-center justify-center font-sans">
      <main className="text-center">
        <Image
          className="mb-8"
          src="/politechnika-krakowska-logo.svg"
          alt="Logo Politechniki Krakowskiej"
          width={100}
          height={100}
          priority
        />
        <div className="text-xl font-merriweather">
          Witaj na stronie sklepu komputerowego 2025DT!
        </div>
        </main>
        </div>
  );
}