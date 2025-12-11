// UWAGA: Użyj ID użytkownika utworzonego przez seed.ts dla testów bez logowania
// Zmienna ta powinna być pobrana z pliku .env/konfiguracji w prawdziwej aplikacji
// Tutaj wpisujemy przykładowy email, bo w bazie user.id to CUID (string), ale Prisma znajdzie po emailu w seedzie
export const TEMP_USER_ID = 'user@pk.edu.pl';