import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                deepSpace: '#181818',
                holoCyan: '#00D9FF',
                holoCyanBright: '#00FFE0',
                paperWhite: '#FFFEF9',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'gravity-pull': 'gravity-pull 1s ease-in-out forwards',
                'particle': 'particle-drift 2s ease-out forwards',
                'ripple': 'ripple 1.5s ease-out infinite',
                'shimmer': 'shimmer 3s infinite',
            },
        },
    },
    plugins: [],
};

export default config;
