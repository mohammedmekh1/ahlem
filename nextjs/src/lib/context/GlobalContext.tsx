// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASaaSClientAuthenticated as createSPASaaSClient } from '@/lib/supabase/client';


type User = {
    email: string;
    id: string;
    registered_at: Date;
    is_admin?: boolean;
};

interface GlobalContextType {
    loading: boolean;
    user: User | null;  // Add this
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);  // Add this

    useEffect(() => {
        async function loadData() {
            try {
                const supabase = await createSPASaaSClient();
                const client = supabase.getSupabaseClient();

                // Get user data
                const { data: { user } } = await client.auth.getUser();
                if (user) {
                    const { data: profile } = await client
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single();

                    setUser({
                        email: user.email!,
                        id: user.id,
                        registered_at: new Date(user.created_at),
                        is_admin: profile?.is_admin || false
                    });
                } else {
                    throw new Error('User not found');
                }

            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return (
        <GlobalContext.Provider value={{ loading, user }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};