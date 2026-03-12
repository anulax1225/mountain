## Testing

This project uses **Pest** (backend), **Vitest** (frontend), and **Dusk** (E2E). All commands run through Laravel Sail.

### Pest (Backend)

```bash
# Full suite
vendor/bin/sail artisan test --compact

# Single file
vendor/bin/sail artisan test --compact tests/Feature/Api/ProjectControllerTest.php

# Filter by test name
vendor/bin/sail artisan test --compact --filter="admin can create a project"
```

- Config: `phpunit.xml` (sets `DB_DATABASE=testing`, array drivers for cache/session/mail).
- Bootstrap: `tests/Pest.php` — extends `TestCase`, uses `RefreshDatabase`, defines helpers (`seedRoles`, `createAdmin`, `createClient`, `createProjectOwner`, `createProjectViewer`).
- Write tests in **Pest syntax** (`test()`, `it()`, `expect()`), not PHPUnit classes.
- Use **factories** with existing states. Use `fake()` for faker data.
- Feature tests for Inertia pages use `assertInertia(fn (Assert $page) => ...)`.
- Run `vendor/bin/sail bin pint --dirty --format agent` after writing PHP tests.
- Never use or modify the main `laravel` database during tests.

### Vitest (Frontend)

```bash
# Watch mode
vendor/bin/sail npm run test

# Single run (CI)
vendor/bin/sail npm run test:run

# Single file
vendor/bin/sail npm run test:run -- resources/js/composables/__tests__/useForm.test.js

# Filter by name
vendor/bin/sail npm run test:run -- -t "validates required fields"
```

- Config: `vitest.config.ts` (jsdom, `@` alias to `resources/js`).
- Setup: `resources/js/test/setup.ts` — mocks `@inertiajs/vue3` (usePage, router, Link, useForm).
- Test files live in `__tests__/` directories next to the code they test.
- Mount components with `@vue/test-utils` `mount()`, using `global.stubs` for child components.

### Dusk (E2E)

**Prerequisites:** Services must be running, frontend must be built, Octane reloaded.

```bash
vendor/bin/sail up -d
vendor/bin/sail npm run build
vendor/bin/sail artisan octane:reload

# Full E2E suite
vendor/bin/sail artisan dusk

# Single file
vendor/bin/sail artisan dusk tests/Browser/AuthenticationFlowTest.php

# Filter by name
vendor/bin/sail artisan dusk --filter="login with valid credentials"
```

- Config: `.env.dusk.local` (`APP_URL=http://laravel.test`, `DUSK_DRIVER_URL=http://selenium:4444/wd/hub`).
- Uses `DatabaseTruncation` (not `RefreshDatabase`) — dropping tables crashes RoadRunner workers.
- Use **Page Objects** (`tests/Browser/Pages/`) for selectors and reusable interactions.
- Always `waitForText()` / `waitForLocation()` before asserting — the SPA needs hydration time.
- Use `afterEach(function () { static::closeAll(); })` to avoid browser state pollution between tests.
- Debug with `$browser->screenshot('name')` and `$browser->storeSource('name')`.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page in Dusk | `vendor/bin/sail artisan octane:reload` (Octane caches old Vite manifest) |
| Dusk tests pass solo but fail in suite | Add `afterEach(fn () => static::closeAll())` |
| Selenium connection refused | `vendor/bin/sail up -d` (selenium container not running) |
| Element not found in Dusk | Add `waitForText()` or `pause()` before interaction |

### Test structure

```
tests/
├── Pest.php                      # Config, shared helpers
├── TestCase.php                  # Base Laravel TestCase
├── DuskTestCase.php              # Headless Chrome / Selenium config
├── Unit/
│   ├── Models/                   # Eloquent model tests
│   ├── Policies/                 # Authorization policy tests
│   ├── Requests/                 # Form request validation tests
│   └── Services/                 # Service class tests
├── Feature/
│   ├── Auth/                     # Authentication flow tests
│   ├── Public/                   # Public route tests
│   ├── Web/                      # Inertia controller tests
│   ├── Api/                      # JSON API controller tests
│   ├── Middleware/                # Middleware tests
│   └── Uploads/                  # Chunked upload tests
└── Browser/
    ├── Pages/                    # Page Objects
    ├── *Test.php                 # E2E test files
    ├── console/                  # Console logs (gitignored)
    ├── screenshots/              # Failure screenshots (gitignored)
    └── source/                   # Page source dumps (gitignored)

resources/js/
├── test/setup.ts                 # Global Inertia mocks
├── composables/__tests__/        # Composable unit tests
├── components/__tests__/         # Component tests
└── pages/__tests__/              # Page-level tests
```