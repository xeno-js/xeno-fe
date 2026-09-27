import { SupabaseClient, type SupabaseClientOptions } from '@supabase/supabase-js'
import type { AuthConfig, IExtendendAuthService, IFactory } from '@xeno-js/shared'
import {
  Guards,
  StorageHelper,
  SupabaseAuthService,
  SupabaseClaimsMapper,
  SupabaseSessionMapper,
} from '@xeno-js/shared'

export class SupabaseAuthFactory implements IFactory<
  AuthConfig<SupabaseClientOptions<'public'>>,
  IExtendendAuthService
> {
  public create(config: AuthConfig<SupabaseClientOptions<'public'>>): IExtendendAuthService {
    if (!Guards.isDefined(config.storageOpts))
      throw new Error('[Xeno CLI Error]: Aborted. Please provide a storage option.')

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
