// stores/auth/login
import { create } from 'zustand';
import { fetchUserApiToken } from '@api/services/generalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set) => ({
    isLoggedIn: false,
    user: null,
    // login: accepts a user object (from Odoo or admin) and enriches it with API token(s)
    login: async (userData) => {
        try {
            // set initial user quickly so UI can react
            set({ isLoggedIn: true, user: userData });
            const uid = userData?.uid || userData?.id || null;
            let enrichedUser = { ...userData, api_token: null, api_keys: [] };
            if (uid) {
                const tokenResult = await fetchUserApiToken(uid);
                if (tokenResult && !tokenResult.error) {
                    enrichedUser = { ...enrichedUser, api_token: tokenResult.api_token || null, api_keys: tokenResult.api_keys || [] };
                }
            }
            // update store with enriched user and persist
            set({ user: enrichedUser });
            try { await AsyncStorage.setItem('userData', JSON.stringify(enrichedUser)); } catch (e) { console.warn('Failed to persist userData', e); }
        } catch (err) {
            console.error('useAuthStore.login error:', err);
            set((state) => ({ user: { ...(state.user || {}), api_token: null, api_keys: [] } }));
        }
    },
    logout: () => set({ isLoggedIn: false, user: null }),
}));

export default useAuthStore;
