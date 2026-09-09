// infrastructure/services/auth/supabase-frontend-auth.service.ts
import type { Provider, Session as SupabaseSession, SupabaseClient, User } from '@supabase/supabase-js'
import type { AuthClaims, IBaseMapper, Maybe, Optional, ResultType, Session } from '@xeno-js/shared'
import { AppError, Guards, Result } from '@xeno-js/shared'

import type { IFrontendAuthService } from '@/domain'

export class SupabaseFrontendAuthService implements IFrontendAuthService {
    constructor(
        private readonly _supabase: SupabaseClient,
        private readonly _mapper: IBaseMapper<User, AuthClaims>,
        private readonly _sessionMapper: IBaseMapper<SupabaseSession, Session>,
        private readonly _provider: Provider = 'google',
        private readonly _redirectTo = `${window.location.origin}/auth/callback`,
    ) { }

    public async signInWithProvider(): Promise<ResultType<void>> {
        const { error } = await this._supabase.auth.signInWithOAuth({
            provider: this._provider,
            options: {
                redirectTo: this._redirectTo,
            },
        })

        if (Guards.isDefined(error)) {
            return Result.fail(
                AppError.authFailed('SupabaseFrontendAuthService', error.message),
            )
        }

        return Result.ok()
    }

    public async handleAuthCallback(): Promise<ResultType<Session>> {
        const response = await this.getSession()

        if (!response.isOk() || !Guards.isDefined(response.getValueOrThrow())) {
            const message = !response.isOk() ? response.getErrorOrThrow().message : 'Failed to handle session callback'
            return Result.fail(
                AppError.authFailed(
                    'SupabaseFrontendAuthService',
                    message,
                ),
            )
        }

        return Result.ok(response.getValueOrThrow()!)
    }

    public async getSession(): Promise<ResultType<Maybe<Session>>> {
        const { data, error } = await this._supabase.auth.getSession()
        if (Guards.isDefined(error)) {
            return Result.fail(AppError.authFailed('SupabaseFrontendAuthService', error.message))
        }

        const session = data.session

        if (Guards.isDefined(session))
            return Result.ok(this._sessionMapper.map(data.session!))

        return Result.ok()
    }

    public async getUser(): Promise<ResultType<Maybe<AuthClaims>>> {
        const { data, error } = await this._supabase.auth.getUser()
        if (Guards.isDefined(error)) {
            return Result.fail(AppError.authFailed('SupabaseFrontendAuthService', error.message))
        }
        const user = data.user
        if (Guards.isDefined(user))
            return Result.ok(this._mapper.map(user))

        return Result.ok()
    }

    public async signOut(): Promise<ResultType<void>> {
        const { error } = await this._supabase.auth.signOut()
        if (Guards.isDefined(error)) {
            return Result.fail(AppError.authFailed('SupabaseFrontendAuthService', error.message))
        }
        return Result.ok()
    }

    public async getSessionToken(): Promise<ResultType<Optional<string>>> {
        const sessionResult = await this.getSession()
        if (!sessionResult.isOk()) {
            return Result.fail(sessionResult.getErrorOrThrow())
        }
        const session = sessionResult.getValueOrThrow()
        return Result.ok(session?.accessToken)
    }
}