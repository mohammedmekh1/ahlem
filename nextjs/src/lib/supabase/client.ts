import {createBrowserClient} from '@supabase/ssr'
import {ClientType, SaaSClient} from "@/lib/supabase/unified";
import {Database} from "@/lib/types";

export function createSPAClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export async function createSPASaaSClient() {
    const client = createSPAClient();
    return new SaaSClient(client as any, ClientType.SPA);
}

export async function createSPASaaSClientAuthenticated() {
    const client = createSPAClient();
    const user = await client.auth.getSession();
    if (!user.data || !user.data.session) {
        window.location.href = '/auth/login';
    }
    return new SaaSClient(client as any, ClientType.SPA);
}