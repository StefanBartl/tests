// .prettierrc.js

export default {
  // Common choices: 80 (classic), 100 (comfortable), 120 (lenient).
  printWidth: 80,

  // Number of spaces per indentation level.
  tabWidth: 4,

  // Use tabs instead of spaces for indentation.
  // false = use spaces (most JS/TS projects); true = use tabs.
  useTabs: false,

  // Print semicolons at the ends of statements.
  // true = add semicolons; false = omit (depends on linting rules).
  semi: true,

  // Use single quotes instead of double quotes.
  // Note: in JSX, singleQuote affects only non-HTML attributes unless jsxSingleQuote is true.
  singleQuote: true,

  // When possible, put trailing commas where valid in ES5 (objects, arrays, etc.).
  // Options: "none", "es5", "all". "es5" is a safe default; keep "none" if the project prefers it.
  trailingComma: "none",

  // Print spaces between brackets in object literals.
  bracketSpacing: true,

  // Put the > of a multi-line JSX element at the end of the last line instead of alone on the next line.
  // false = put > on the same line as the last prop; true = put on new line.
  jsxBracketSameLine: false,

  // Include parentheses around a sole arrow function parameter.
  // "always" => (x) => x
  // "avoid"  => x => x
  arrowParens: "always",

  // Control end of line sequence. "lf" is the safest cross-platform choice.
  endOfLine: "lf",

  // For TypeScript/JSX ensure consistent formatting of props and tags.
  jsxSingleQuote: false,

  // Format markdown and other text files conservatively.
  proseWrap: "preserve",

  // Preserve existing line breaks where possible (good for diffs).
  htmlWhitespaceSensitivity: "css",

  // Optional: apply different rules for specific file types.
  overrides: [
    {
      // Use a smaller print width for markdown to improve readability.
      files: ["*.md", "*.markdown"],
      options: { printWidth: 80, proseWrap: "always" },
    },
    {
      // For JSON use double quotes and no trailing comma (JSON standard).
      files: ["*.json", ".prettierrc"],
      options: { parser: "json", trailingComma: "none", tabWidth: 2, singleQuote: false },
    },
    {
      // For YAML, smaller indentation is common.
      files: ["*.yml", "*.yaml"],
      options: { tabWidth: 2 },
    },
  ],
};
