# Owlaround Development Documentation

This documentation provides standards and patterns for developing the Owlaround 360° panoramic photo editor platform.

## Quick Navigation

| Document | Description |
|----------|-------------|
| [Architecture Overview](01-architecture-overview.md) | Tech stack, data model, request flow |
| [Backend Standards](02-backend-standards.md) | Laravel controllers, models, policies, routes |
| [Frontend Standards](03-frontend-standards.md) | Vue pages, components, state management |
| [API Communication](04-api-communication.md) | owl-sdk usage and patterns |
| [Components Guide](05-components-guide.md) | Component architecture and UI library |
| [Composables Reference](06-composables-reference.md) | All available composables with examples |
| [Form Handling](07-form-handling.md) | Forms, validation, file uploads |
| [Error Handling](08-error-handling.md) | Error patterns and user messages |
| [3D Rendering](09-3d-rendering.md) | Three.js patterns for the editor |

---

## Purpose

This documentation serves three goals:

1. **Standardization** - Ensure consistent patterns across the codebase
2. **Onboarding** - Help new developers understand the architecture
3. **Auditing** - Enable identification of non-standard implementations

---

## Core Principles

### 1. Use What Exists

Before writing new code, check if functionality already exists:

- **Composables** → [Composables Reference](06-composables-reference.md)
- **UI Components** → [Components Guide](05-components-guide.md)
- **3D Utilities** → [3D Rendering](09-3d-rendering.md)

### 2. Follow Established Patterns

Each layer has standard patterns:

| Layer | Pattern Document |
|-------|------------------|
| Controllers | [Backend Standards](02-backend-standards.md#controllers) |
| Models | [Backend Standards](02-backend-standards.md#models) |
| Vue Pages | [Frontend Standards](03-frontend-standards.md#page-components) |
| Components | [Frontend Standards](03-frontend-standards.md#component-patterns) |
| API Calls | [API Communication](04-api-communication.md) |
| Forms | [Form Handling](07-form-handling.md) |
| Errors | [Error Handling](08-error-handling.md) |

### 3. Never Hardcode

All magic numbers belong in constants:

```javascript
// ❌ Never
point.multiplyScalar(0.95)
setTimeout(fn, 100)

// ✅ Always
import { SPRITE, TIMING } from '@/lib/editorConstants'
point.multiplyScalar(SPRITE.POSITION_SCALE)
setTimeout(fn, TIMING.HOVER_DELAY_MS)
```

### 4. Always Use owl-sdk

All API calls go through owl-sdk:

```javascript
// ❌ Never
fetch('/api/projects')
axios.get('/projects')

// ✅ Always
import { owl } from '@/owl-sdk'
await owl.projects.list()
```

### 5. Always Use Composables

Never reimplement composable functionality:

```javascript
// ❌ Never
const confirmed = window.confirm('Delete?')
const date = new Intl.DateTimeFormat('fr-FR').format(d)

// ✅ Always
import { useConfirm, useDateTime } from '@/composables'
const { confirmDelete } = useConfirm()
const { formatSmartDate } = useDateTime()
```

---

## Quick Start by Task

### Adding a New Feature

1. Read [Architecture Overview](01-architecture-overview.md)
2. Create backend: [Backend Standards](02-backend-standards.md)
3. Create frontend: [Frontend Standards](03-frontend-standards.md)
4. Connect API: [API Communication](04-api-communication.md)

### Creating a New Component

1. Check [Components Guide](05-components-guide.md) for existing similar components
2. Follow component structure in [Frontend Standards](03-frontend-standards.md#component-patterns)
3. Use UI primitives from [Components Guide](05-components-guide.md#ui-component-usage)

### Adding a Form

1. Choose pattern: [Form Handling](07-form-handling.md)
2. Use `useForm` for validation
3. Use `useImageUpload` for file uploads
4. Handle errors: [Error Handling](08-error-handling.md)

### Working on 3D Editor

1. Read [3D Rendering](09-3d-rendering.md)
2. Use constants from `editorConstants.js`
3. Use math from `spatialMath.js`
4. Use `SpriteFactory` and `SpriteManager`

### Making API Calls

1. Read [API Communication](04-api-communication.md)
2. Always use owl-sdk
3. Wrap in try-catch
4. Use `useApiError` for error handling

---

## Checklist for New Code

### Backend Checklist

- [ ] Controller uses FormRequest for validation
- [ ] Controller calls `$this->authorize()` with policy
- [ ] Model has UUID slug generation in `boot()`
- [ ] Model has `getRouteKeyName()` returning `'slug'`
- [ ] Model has cascade deletion in `deleting` hook
- [ ] Route uses `{model:slug}` binding
- [ ] Resource includes `permissions` for frontend

### Frontend Checklist

- [ ] Component uses `<script setup>`
- [ ] Props defined with `defineProps`
- [ ] Events defined with `defineEmits`
- [ ] API calls use owl-sdk
- [ ] Errors handled with `useApiError`
- [ ] Loading states shown
- [ ] Empty states shown
- [ ] Permissions checked before showing actions

### 3D Editor Checklist

- [ ] No hardcoded values (use `editorConstants`)
- [ ] Math uses `spatialMath` utilities
- [ ] Sprites use `SpriteFactory`
- [ ] Scene uses `useThreeScene`
- [ ] Panoramas use `usePanoramaLoader`
- [ ] Interaction tracked by slug (not reference)

---

## Updating This Documentation

Update documentation when:

1. Adding new patterns or conventions
2. Creating new composables
3. Adding new UI components
4. Changing architectural decisions
5. Finding undocumented patterns in codebase

Documentation should be:

- **Accurate** - Match actual code
- **Concise** - Easy to scan
- **Practical** - Include code examples
- **Current** - Updated with codebase

---

## Related Resources

- **CLAUDE.md** - AI assistant context (project root)
- **API Docs** - `/docs` route (Laravel Scribe)
- **shadcn/vue** - [ui.shadcn.com](https://ui.shadcn.com)
- **Lucide Icons** - [lucide.dev](https://lucide.dev)
- **Three.js** - [threejs.org](https://threejs.org)
