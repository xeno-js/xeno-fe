# Changelog

All notable changes to Xeno Vue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.0.html).

## [0.1.5] - 2026-05-27

### Added

- Frontend CQRS implementation via `ClientMediator` supporting strongly-typed
  commands and queries in the browser.
- Fluent configuration root (`XenoAppBuilder`) for explicit Dependency Injection
  container setup in Vue applications.
- Reactive composables pattern separating UI state from business logic with
  native `AbortSignal` cooperative cancellation support.
- Agnostic remote data sources (`RemoteDataSource`) encapsulating Axios
  transport and delegating resilience to the backend.
- Lazy-load initialization for heavy peer dependencies like Sentry and Supabase
  to optimize Core Web Vitals.

### Fixed

- Stabilized type inference across custom frontend registries
  (`XenoVueRegistry`).
- Improved memory management and cleanup of pending network requests on
  component unmount lifecycle hooks.

### Security

- Enforced Anti-Corruption Layer (ACL) and mappers (`SupabaseClaimsMapper`,
  `SupabaseSessionMapper`) to decouple identity management and prevent vendor
  lock-in.
