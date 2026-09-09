import type { Optional } from "@xeno-js/shared"

import type { Provider } from "@/domain"

export interface FrontendAuthConfig {
    url: string
    key: string
    opts: Optional<{
        persistSession: boolean,
        autoRefreshToken: boolean,
        detectSessionInUrl: boolean,
        flowType: 'pkce',
    }>
    storageType: Optional<'local' | 'session' | 'memory'>
    redirectTo: Optional<string>
    provider: Provider
}