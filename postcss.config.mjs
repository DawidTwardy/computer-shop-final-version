/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
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
    
    // Dodajemy, aby jawnie zignorować pg (kluczowe dla adapterów Prisma)
    config.externals = [...config.externals, 'pg', 'pg-native']; 

    return config;
  },
  // Poprawka dla błędu PostCSS
  // PostCSS config is now standard, no extra options needed here.
};

export default nextConfig;
