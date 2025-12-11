/** @type {import('next').NextConfig} */
const nextConfig = {
  // UWAGA: Usunięto nieprawidłowy klucz 'postcss', który powodował błąd
  
  webpack: (config, { isServer }) => {
    // Konfiguracja rozwiązująca problem "Can't resolve 'fs', 'net', etc."
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        tls: false,
        module: false,
        path: false,
        stream: false,
        buffer: false,
        util: false,
        crypto: false,
        url: false,
        os: false,
        assert: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        tty: false,
        constants: false,
        string_decoder: false,
        events: false,
        child_process: false,
        vm: false,
      };
    }
    
    // Jawne ignorowanie modułów pg na kliencie
    config.externals = [...config.externals, 'pg', 'pg-native']; 

    return config;
  },
};

export default nextConfig;
