// infrastructure/factories/supabase-frontend-auth.factory.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { IFactory, Optional } from '@xeno-js/shared'
import { SupabaseClaimsMapper, SupabaseSessionMapper } from '@xeno-js/shared'

import type { IFrontendAuthService } from '@/domain'

import { SupabaseFrontendAuthService } from '../auth/supabase.auth'
import type { FrontendAuthConfig } from '../modules/config/auth.config'
import { createMemoryStorage } from '../storage/memory.storage'

export class SupabaseFrontendAuthFactory implements IFactory<FrontendAuthConfig, IFrontendAuthService> {
    public create(config: FrontendAuthConfig): IFrontendAuthService {
        console.log(config)
        const client = new SupabaseClient(config.url, config.key, {
            auth: {
                ...config.opts,
                storage: this.getStorage(config.storageType)
            }
        })

        const mapper = new SupabaseClaimsMapper()
        const sessionMapper = new SupabaseSessionMapper(mapper)
        return new SupabaseFrontendAuthService(client, mapper, sessionMapper, config.provider, config.redirectTo)
    }

    private getStorage(type: Optional<'local' | 'session' | 'memory'>) {
        switch (type) {
            case 'memory':
                return createMemoryStorage()
            case 'session':
                return sessionStorage
            case 'local':
                return localStorage
        
            default:
                return undefined
        }
    }
}