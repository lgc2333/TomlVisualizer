import antfu from '@antfu/eslint-config'

export default antfu(
  {},
  {
    rules: {
      'style/jsx-one-expression-per-line': 'off',
      'style/brace-style': 'off',
      'style/arrow-parens': 'off',
      'style/quote-props': 'off',
      'style/operator-linebreak': 'off',
      'antfu/if-newline': 'off',
      'style/multiline-ternary': 'off',
      'style/quotes': 'off',
      'style/member-delimiter-style': 'off',
      'style/jsx-wrap-multilines': 'off',
    },
  },
)
