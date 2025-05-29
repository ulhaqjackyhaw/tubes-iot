// D:\tubes iot\main\Monitoring\Sistem_Monitoring_Fire_Detection\functions\.eslintrc.js
module.exports = {
  env: {
    es6: true,
    node: true, // <-- INI SANGAT PENTING
  },
  parserOptions: {
    ecmaVersion: 2018, // Atau versi yang lebih baru jika Anda menggunakan fitur ES yang lebih baru
    // Jika Anda menggunakan ES Modules (import/export), tambahkan:
    // sourceType: "module", // Tapi untuk Firebase Functions standar, 'script' (default) biasanya cukup
  },
  extends: [
    "eslint:recommended",
    "google", // Jika Anda memilih style guide Google saat init
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    // Aturan untuk variabel yang tidak terpakai:
    // Izinkan argumen fungsi yang tidak terpakai jika diawali dengan underscore
    // Izinkan variabel lokal yang tidak terpakai jika diawali dengan underscore
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "require-jsdoc": "off", // Matikan jika Anda tidak ingin enforce JSDoc
    // Anda bisa menambahkan atau mengubah aturan lain di sini
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {
    // Jika ada global lain yang perlu Anda definisikan
  }
};