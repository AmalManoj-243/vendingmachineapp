// src/api/odooConfig.js
// Dynamic Odoo configuration - URL and DB are set from the login screen
// and persisted in AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';

let _odooBaseUrl = '';
let _odooDb = '';

/**
 * Set Odoo URL and DB (called after login) and persist to AsyncStorage.
 */
export const setOdooConfig = async (url, db) => {
  _odooBaseUrl = (url || '').replace(/\/+$/, '');
  _odooDb = (db || '').trim();
  try {
    await AsyncStorage.setItem('odoo_base_url', _odooBaseUrl);
    await AsyncStorage.setItem('odoo_db', _odooDb);
  } catch (e) {
    console.warn('Failed to persist Odooo config:', e);
  }
};

/**
 * Get the current Odoo base URL (no trailing slash).
 */
export const getOdooBaseUrl = () => _odooBaseUrl;

/**
 * Get the current Odoo database name.
 */
export const getOdooDb = () => _odooDb;

/**
 * Restore Odoo config from AsyncStorage (call on app startup).
 */
export const initOdooConfig = async () => {
  try {
    const url = await AsyncStorage.getItem('odoo_base_url');
    const db = await AsyncStorage.getItem('odoo_db');
    if (url) _odooBaseUrl = url;
    if (db) _odooDb = db;
  } catch (e) {
    console.warn('Failed to restore Odoo config:', e);
  }
};
