/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['selector', '[data-theme="dark"]'],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#FB9E45',
                    DEFAULT: '#FA8112', // Vibrant Orange
                    dark: '#D66A05',
                },
                secondary: {
                    light: '#F5E7C6', // Darker Beige
                    DEFAULT: '#F5E7C6',
                    dark: '#E0CFA0',
                },
                bg: {
                    primary: '#FAF3E1', // Cream/Light Beige
                    secondary: '#F5E7C6',
                    card: 'rgba(255, 255, 255, 0.6)', // Glass base
                    elevated: '#FFFFFF',
                },
                text: {
                    primary: '#222222', // Dark Gray/Black
                    secondary: '#4A4A4A',
                }
            },
            fontFamily: {
                arabic: ['Scheherazade New', 'Amiri', 'serif'], // Refined Quranic Typography
                ui: ['Cairo', 'Inter', 'sans-serif'], // Cairo for titles/UI
                'cairo-play': ['"Cairo Play"', 'sans-serif'], // Special font for Sakina title
                'reem-kufi-fun': ['"Reem Kufi Fun"', 'sans-serif'], // Reem Kufi Fun for Sakinah title
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            backgroundImage: {
                'gradient-islamic': 'linear-gradient(135deg, #1B4D3E 0%, #2D6A4F 50%, #1B4D3E 100%)',
                'gradient-gold': 'linear-gradient(135deg, #C9A227 0%, #D4AF37 50%, #C9A227 100%)',
                'gradient-cream': 'linear-gradient(180deg, #FAF7F0 0%, #F5F0E6 100%)',
            },
            boxShadow: {
                'islamic': '0 4px 20px rgba(27, 77, 62, 0.15)',
                'islamic-lg': '0 8px 30px rgba(27, 77, 62, 0.2)',
                'gold': '0 4px 20px rgba(201, 162, 39, 0.2)',
                'gold-lg': '0 8px 30px rgba(201, 162, 39, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
