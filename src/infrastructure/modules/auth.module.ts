import type { IFrontendAuthService } from "@/domain";

import type { FrontendAuthConfig } from "./config/auth.config";

export class AuthModule {
    public static async create(opts: FrontendAuthConfig): Promise<IFrontendAuthService> {
        const { Guards } = await import("@xeno-js/shared")

        if (!Guards.isDefined(opts.url) || !Guards.isDefined(opts.key)) {
            throw new Error('[Auth Error]: Supabase URL and Key are required for frontend authentication.')
        }

        const { SupabaseFrontendAuthFactory } = await import('../factories/supabase.factory')
        return new SupabaseFrontendAuthFactory().create(opts)
    }
}