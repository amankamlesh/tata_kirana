/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                accent: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            },
            boxShadow: {
                'card': '0 2px 16px 0 rgba(0,0,0,0.08)',
                'card-hover': '0 8px 32px 0 rgba(0,0,0,0.14)'
            }
        },
    },
    plugins: [],
}
