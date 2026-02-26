import { describe, it, expect, vi } from 'vitest'
import { SaaSClient, ClientType } from '../supabase/unified'
import { SupabaseClient } from '@supabase/supabase-js'

describe('SaaSClient', () => {
    const mockSupabase = {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                range: vi.fn(() => ({
                    order: vi.fn(() => ({
                        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
                    }))
                }))
            }))
        })),
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn(),
                list: vi.fn(),
                remove: vi.fn(),
                createSignedUrl: vi.fn(),
            }))
        }
    } as unknown as SupabaseClient

    it('should initialize correctly', () => {
        const client = new SaaSClient(mockSupabase, ClientType.SPA)
        expect(client).toBeDefined()
    })

    it('should call signInWithPassword on loginEmail', async () => {
        const client = new SaaSClient(mockSupabase, ClientType.SPA)
        await client.loginEmail('test@example.com', 'password123')
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        })
    })

    it('should call signUp on registerEmail', async () => {
        const client = new SaaSClient(mockSupabase, ClientType.SPA)
        await client.registerEmail('test@example.com', 'password123')
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123'
        })
    })
})
