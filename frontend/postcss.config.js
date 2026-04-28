export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Only minify in production
        ...(process.env.NODE_ENV === 'production' ? {
            cssnano: {
                preset: 'default'
            }
        } : {})
  }
};
