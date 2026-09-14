// infrastructure/factories/supabase-frontend-auth.factory.ts
import { SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js'
import type { AuthConfig, IExtendendService, IFactory } from '@xeno-js/shared'
import {
  StorageHelper,
  SupabaseAuthService,
  SupabaseClaimsMapper,
  SupabaseSessionMapper,
} from '@xeno-js/shared'

export class SupabaseAuthFactory implements IFactory<
  AuthConfig<SupabaseClientOptions<'public'>>,
  IExtendendService
> {
  public create(config: AuthConfig<SupabaseClientOptions<'public'>>): IExtendendService {
    const client = new SupabaseClient(config.url, config.key, {
      auth: {
        ...config.opts,
        storage: StorageHelper.create(config.storageOpts),
      },
    })

    const mapper = new SupabaseClaimsMapper()
    const sessionMapper = new SupabaseSessionMapper(mapper)
    return new SupabaseAuthService(client, mapper, sessionMapper, config)
  }
}
