/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                'angeles-blue': '#0038A8',   // Header Blue
                'angeles-red': '#CE1126',    // Submission Card Red
                'angeles-yellow': '#FCD116', // Authenticity Yellow
                'soft-bg': '#FDF9F0',        // Your off-white background
            },
        },
    },
    plugins: [],
}