// src/api/odooConfig.js

// 🔹 Put your Odoo server URL here ONE time
// Current test server
const ODOO_BASE_URL = "http://103.42.198.95:8969/";

// Default DB to use for Odoo JSON-RPC login (change to your test DB)
const DEFAULT_ODOO_DB = "testdb2";


// Named export for default base URL for backward compatibility
const DEFAULT_ODOO_BASE_URL = ODOO_BASE_URL;

export { DEFAULT_ODOO_DB, DEFAULT_ODOO_BASE_URL };
export default ODOO_BASE_URL;
