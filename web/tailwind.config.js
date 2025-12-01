/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brazil: {
                    green: '#009c3b',
                    yellow: '#ffdf00',
                    blue: '#002776',
                    white: '#ffffff',
                }
            }
        },
    },
    plugins: [],
}
