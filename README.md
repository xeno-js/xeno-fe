<div align="center">
  <img src="logo/logo.png" alt="Xeno Vue Logo" width="140" />

  <h1>Xeno Vue</h1>

  <p><strong>Your UI framework handles the UI. Xeno handles the application.</strong></p>

  <p>
    Application architecture for Vue with explicit dependency injection,
    CQRS, composable pipelines, and clear boundaries between presentation,
    application behavior, and infrastructure.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@xeno-js/vue">
      <img src="https://img.shields.io/npm/v/@xeno-js/vue?style=flat-square" alt="npm version" />
    </a>
    <a href="https://github.com/xeno-js/xeno-fe">
      <img src="https://img.shields.io/github/stars/xeno-js/xeno-fe?style=flat-square" alt="GitHub stars" />
    </a>
    <a href="https://img.shields.io/npm/l/@xeno-js/vue?style=flat-square">
      <img src="https://img.shields.io/npm/l/@xeno-js/vue?style=flat-square" alt="License: MIT" />
    </a>
    <a href="https://buymeacoffee.com/xenojs">
      <img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-FFdd00?style=flat-square&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
    </a>
  </p>
</div>

---

## What is Xeno Vue?

**Xeno Vue** (`@xeno-js/vue`) brings Xeno's application architecture to Vue
applications.

It provides the composition root and application building blocks needed to keep
application behavior explicit instead of putting all of it inside Vue
components.

The package is built around:

- explicit dependency injection;
- a typed application registry;
- commands and queries through a client-side mediator;
- composable application pipelines;
- remote data source boundaries;
- browser request and identity context;
- optional authentication, logging, validation, and caching integrations.

The goal is simple:

> **Keep Vue responsible for presentation. Keep application behavior explicit.**

---

## The boundary

A Vue application does not need to put every concern into components, stores, or
router handlers.

Xeno gives the application layer a distinct place to live:

```text
Vue UI
    ↓
Application
    ↓
Domain / Shared
    ↓
Infrastructure
    ↓
HTTP / external systems
```

Vue remains your presentation layer.

Xeno provides the application composition and execution model around it.

---

## Why Xeno Vue?

As an application grows, API calls, validation, logging, caching,
authentication, and application decisions can end up spread across components.

Xeno makes those responsibilities explicit.

### Explicit dependency injection

`XenoAppBuilder` is the composition root.

Dependencies are registered in code instead of being discovered through
decorators, runtime scanning, or hidden framework conventions.

```ts
import { XenoAppBuilder } from '@xeno-js/vue'

const builder = XenoAppBuilder.create()
```

You configure the services your application needs through the builder.

---

### CQRS in the browser

The client mediator exposes two execution paths:

```text
Command
   ↓
Command pipeline
   ↓
Application action

Query
   ↓
Query pipeline
   ↓
Application action
```

Commands are sent with:

```ts
await services.mediator.send(command, action)
```

Queries are executed with:

```ts
await services.mediator.query(query, action)
```

The application action is supplied by your code, so the transport remains behind
an infrastructure boundary.

---

## Pipelines

Cross-cutting behavior belongs in the application execution pipeline.

The current implementation provides pipeline building blocks for:

- exception handling;
- logging;
- performance thresholds;
- validation with Zod schemas;
- query caching.

Pipelines are composed by the application module and executed around commands
and queries.

For example:

```ts
builder.addPipeline((config) => {
  config.queryCaching = true
  config.threshold = 500
})
```

Query caching uses the configured cache and is intended for query requests.

---

## Remote data sources

HTTP concerns can be isolated behind a remote data source.

```ts
import { RemoteDataSource } from '@xeno-js/vue'

export class UsersRemoteDataSource extends RemoteDataSource {
  public getById(id: string) {
    return this.get<User>(`/users/${id}`)
  }

  public create(payload: CreateUserPayload) {
    return this.post<User, CreateUserPayload>('/users', payload)
  }
}
```

The data source depends on the framework-neutral HTTP client abstraction.

`XenoAppBuilder.addHttpCore()` then provides the concrete HTTP client and
registers the resulting data source in the application registry.

```ts
type AppRegistry = XenoVueRegistry<{
  users: UsersRemoteDataSource
}>

const builder = XenoAppBuilder.create<AppRegistry>().addHttpCore(
  'users',
  (config) => {
    config.client.baseURL = '/api'
    config.factory = (http) => new UsersRemoteDataSource(http)
  },
)
```

Axios is used by the built-in HTTP adapter when `addHttpCore()` is configured.

---

## Application context

Browser applications still need contextual information around the current
execution.

Xeno provides a browser context accessor containing information such as:

- request ID;
- correlation ID;
- user identity;
- user agent;
- path;
- origin;
- transport metadata.

You can use the default accessor or provide your own implementation.

```ts
builder.addContext((config) => {
  // Optional custom context accessor configuration.
})
```

---

## Logging

Logging is configured independently from the application code.

The package currently supports:

- console logging;
- Sentry logging;
- custom logger clients.

Example:

```ts
builder.addLogger((config) => {
  config.console = true
})
```

Optional integrations are loaded when they are configured, keeping them outside
the default bootstrap path.

---

## Authentication

Supabase authentication is available as an infrastructure integration.

```ts
builder.addAuth((config, env) => {
  config.url = env.getOrThrow('SUPABASE_URL')
  config.key = env.getOrThrow('SUPABASE_KEY')
})
```

The default configuration service resolves `VITE_` environment variables in Vite
applications.

For example:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_KEY
```

Authentication is an integration, not part of the application's business rules.

---

## Validation

Application request validation can be configured with Zod schemas.

```ts
builder.addPipeline((config) => {
  config.schemas = {
    CreateUser: createUserSchema,
    UpdateUser: updateUserSchema,
  }
})
```

Validation is executed as part of the application pipeline.

Zod remains optional until validation schemas are actually configured.

---

## Query caching

The package includes an in-memory cache path for query requests.

Enable it through the pipeline configuration:

```ts
builder.addPipeline((config) => {
  config.queryCaching = true
})
```

Cache keys can be contextual or user-scoped through the shared cache key
builder.

---

## Bootstrap

A complete browser composition root can look like this:

```ts
import { XenoAppBuilder } from '@xeno-js/vue'

const builder = XenoAppBuilder.create()
  .addContext(() => {})
  .addLogger((config) => {
    config.console = true
  })
  .addAuth((config, env) => {
    config.url = env.getOrThrow('SUPABASE_URL')
    config.key = env.getOrThrow('SUPABASE_KEY')
  })
  .addPipeline((config) => {
    config.queryCaching = true
    config.threshold = 500
  })

export async function bootstrap() {
  return builder.build()
}
```

The builder executes the registered tasks and returns a frozen application
registry.

The composition root is application code: there is no requirement to hide it
behind Vue plugins or decorators.

---

## Providing services to Vue

The package exports `XENO_SERVICES_KEY` so the application registry can be made
available through Vue's `provide/inject` mechanism.

```ts
import { createApp } from 'vue'
import { XENO_SERVICES_KEY } from '@xeno-js/vue'

import App from './App.vue'
import { bootstrap } from './bootstrap'

async function mountApp() {
  const app = createApp(App)
  const services = await bootstrap()

  app.provide(XENO_SERVICES_KEY, services)
  app.mount('#app')
}

mountApp()
```

From there, your application code can resolve the registry through Vue's normal
dependency injection mechanism.

The package does not require a custom state-management abstraction.

---

## Keeping application logic outside components

A component can remain focused on presentation while application behavior lives
in a composable or application service written by your project.

For example:

```ts
import { inject } from 'vue'
import { XENO_SERVICES_KEY } from '@xeno-js/vue'

export function useUsersApplication() {
  const services = inject(XENO_SERVICES_KEY)

  if (!services) {
    throw new Error('Xeno services are not available')
  }

  return services
}
```

The composable belongs to your application.

Xeno provides the application infrastructure it uses.

---

## Public API

The package root currently exposes:

```text
XenoAppBuilder
RemoteDataSource
XENO_SERVICES_KEY
```

It also re-exports the public contracts and primitives from `@xeno-js/shared`.

The concrete internal pipeline implementations are assembled by the builder and
are not intended to be the primary public API of the package.

---

## Installation

Install Vue, Shared, and Xeno Vue:

```bash
npm install @xeno-js/vue @xeno-js/shared vue
```

Install the integrations you actually use.

For HTTP data sources:

```bash
npm install axios
```

For validation:

```bash
npm install zod
```

For Supabase authentication:

```bash
npm install @supabase/supabase-js
```

For Sentry:

```bash
npm install @sentry/vue
```

For Vue Router integration:

```bash
npm install vue-router
```

---

## CLI

The Xeno ecosystem includes an official CLI for creating Vue application
structures:

```bash
npx @xeno-js/cli new my-app --vue
```

You can also generate application components inside an existing project:

```bash
npx @xeno-js/cli g command CreateUser --vue
```

CLI:

https://github.com/xeno-js/xeno-cli

---

## Xeno ecosystem

```text
@xeno-js/shared
    Define the application.

@xeno-js/core
    Execute the backend application.

@xeno-js/vue
    Bring the application architecture to Vue.

@xeno-js/cli
    Get started with the structure.
```

A useful mental model is:

```text
Transport
    hosts the application

Application
    executes use cases

Domain
    defines business rules

Infrastructure
    connects external systems
```

---

## Keep your stack

Xeno Vue does not replace Vue.

It does not replace your router.

It does not replace your state management solution.

It provides a place for application behavior and infrastructure composition to
live alongside the tools you already use.

---

## Browser environment

The default configuration service is designed for Vite/browser applications.

The package provides browser-oriented request context data and integrates with
Vue's dependency injection system.

Node.js `20+` is required by the package tooling.

---

## Development

Clone the repository:

```bash
git clone https://github.com/xeno-js/xeno-fe.git
cd xeno-fe
npm install
```

Run the checks:

```bash
npm run check
```

Useful commands:

```bash
npm run build
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run format
```

Development happens from feature branches targeting `develop`.

---

## Contributing

Contributions are welcome.

Create a feature branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature
```

Run the project checks before opening a pull request:

```bash
npm run check
```

We use Conventional Commits:

```text
feat(vue): add application service
fix(datasource): correct request handling
refactor(builder): simplify bootstrap
docs(readme): clarify architecture
```

Open pull requests against:

```text
develop
```

---

## Support

If Xeno is useful to you, you can support the project through the community and
sponsorship channels documented on the website:

**[Support Xeno](https://www.xeno-js.it/docs/support-us)**

---

## License

Copyright (c) 2026 Xeno.

Licensed under the [MIT License](LICENSE).
