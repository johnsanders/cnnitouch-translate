module.exports = {
	env: {
		browser: true,
	},
	extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/no-var-requires': 0,
		'no-invalid-this': 'error',
		'prettier/prettier': 'warn',
		'react/destructuring-assignment': 0,
		'react/prop-types': 0,
		'sort-imports': 'error',
		'sort-keys': 'error',
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.ts'],
			},
		},
	},
};
