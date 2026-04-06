/**
 * ESLint Configuration
 */

module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended'
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        }
    },
    settings: {
        react: {
            version: '18.2'
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx']
            }
        }
    },
    plugins: ['react-refresh', 'jsx-a11y'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true }
        ],
        'react/prop-types': 'off',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-key': 'error',
        'react/no-unescaped-entities': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'jsx-a11y/alt-text': 'warn',
        'jsx-a11y/aria-props': 'warn',
        'jsx-a11y/aria-proptypes': 'warn',
        'jsx-a11y/aria-unsupported-elements': 'warn',
        'jsx-a11y/role-has-required-aria-props': 'warn',
        'jsx-a11y/role-supports-aria-props': 'warn'
    }
};