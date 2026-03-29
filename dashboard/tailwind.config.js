/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0b', // darker background outside
                surface: '#e6e6e8', // light app surface
                card: '#292929',   // dark card inside
                cardAlt: '#2c2c2e',
                primary: '#F43F5E',    // the red from the image
                textDark: '#171717',
                textLight: '#f5f5f5',
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out both',
                'fade-in': 'fadeIn 0.8s ease-out both',
                'fade-in-up-delay-1': 'fadeInUp 0.6s ease-out 0.15s both',
                'fade-in-up-delay-2': 'fadeInUp 0.6s ease-out 0.3s both',
                'fade-in-up-delay-3': 'fadeInUp 0.6s ease-out 0.45s both',
            }
        },
    },
    plugins: [],
}
