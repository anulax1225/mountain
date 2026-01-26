# CLAUDE.md - AI Assistant Context

## Project
360° panoramic photo editor - Laravel 12 + Vue 3 + Three.js

## Critical Rules
1. All API calls through owl-sdk
2. All constants from editorConstants.js (never hardcode)
3. All composables from @/composables
4. Track sprites by slug, not object reference

## Documentation
See docs/ folder for detailed standards:
- docs/02-backend-standards.md - Controllers, models, policies
- docs/03-frontend-standards.md - Vue patterns
- docs/06-composables-reference.md - All composables
- docs/09-3d-rendering.md - Three.js patterns

## Data Model
Project → Scene → Image → Hotspot/Sticker
All use UUID slugs for routing.

## Known Issues
- Sprite interaction system needs refactoring (see docs)

## Quick Reference
[Keep only the most critical patterns that AI needs constantly]