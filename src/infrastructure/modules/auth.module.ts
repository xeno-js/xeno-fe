import type { SupabaseClientOptions } from '@supabase/supabase-js'
import type { AuthConfig, IExtendendService } from '@xeno-js/shared'

export class AuthModule {
  public static async create(
    opts: AuthConfig<SupabaseClientOptions<'public'>>,
  ): Promise<IExtendendService> {
    const { Guards } = await import('@xeno-js/shared')

    if (!Guards.isDefined(opts.url) || !Guards.isDefined(opts.key)) {
      throw new Error(
        '[Auth Error]: Supabase URL and Key are required for frontend authentication.',
      )
    }

    const { SupabaseAuthFactory } = await import('../factories/supabase.factory')
    return new SupabaseAuthFactory().create(opts)
  }
}
