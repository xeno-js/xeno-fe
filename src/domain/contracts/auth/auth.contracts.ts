// domain/contracts/auth/frontend-auth-service.contract.ts
import type { AuthClaims, Maybe, Optional, ResultType, Session } from '@xeno-js/shared'

export interface IFrontendAuthService {
    /**
     * Avvia il flusso di autenticazione OAuth con un provider esterno (es. Google).
     */
    signInWithProvider(): Promise<ResultType<void>>

    /**
     * Gestisce il ritorno dalla pagina di autenticazione (OAuth callback),
     * estraendo i token dall'URL o validando il codice PKCE.
     */
    handleAuthCallback(): Promise<ResultType<Session>>

    /**
     * Restituisce la sessione corrente attiva salvata nel client Supabase.
     */
    getSession(): Promise<ResultType<Maybe<Session>>>

    /**
     * Restituisce l'utente attualmente autenticato.
     */
    getUser(): Promise<ResultType<Maybe<AuthClaims>>>

    /**
     * Esegue il logout dell'utente e pulisce la sessione locale.
     */
    signOut(): Promise<ResultType<void>>

    /**
     * Recupera il token JWT attivo da passare nell'header Authorization delle chiamate API.
     */
    getSessionToken(): Promise<ResultType<Optional<string>>>
}