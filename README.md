# Owlaround

A comprehensive 360° panoramic photo editor and virtual tour creation platform.

## Overview

Owlaround enables users to create interactive virtual tours by compositing panoramic photos and adding navigation hotspots between images. The platform features an immersive 3D viewer built with Three.js, allowing seamless navigation through connected panoramic scenes.

### Key Features

- **360° Panorama Viewer** - Full-viewport Three.js canvas with smooth navigation
- **Hotspot Navigation** - Create clickable links between panoramic images
- **Bidirectional Hotspots** - Automatic return navigation creation
- **Sticker Annotations** - Add emoji and text labels to panoramas
- **Project Management** - Organize tours into projects and scenes
- **Collaboration** - Share projects with team members (Owner/Viewer roles)
- **Public Gallery** - Publish tours for public viewing
- **Dark Mode** - Complete dark theme support

## Tech Stack

### Backend
- **Laravel 12** - PHP framework
- **Inertia.js** - Server-driven SPA
- **Laravel Sanctum** - Authentication
- **MySQL** - Database
- **S3** - File storage

### Frontend
- **Vue.js 3** - UI framework (Composition API)
- **Three.js** - 3D panorama rendering
- **Tailwind CSS** - Styling
- **shadcn/vue** - UI components
- **Vite** - Build tool

## Requirements

- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- S3-compatible storage (AWS S3 or MinIO/RustFS for local dev)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd mountain
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your database and S3 credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=owlaround
DB_USERNAME=root
DB_PASSWORD=

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_ENDPOINT=https://s3.amazonaws.com
```

### 4. Run migrations

```bash
php artisan migrate
```

### 5. Start development servers

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite
npm run dev
```

Visit `http://localhost:8000`

## Development with Docker (Laravel Sail)

```bash
# Start containers
./vendor/bin/sail up -d

# Run migrations
./vendor/bin/sail artisan migrate

# Install npm dependencies
./vendor/bin/sail npm install

# Start Vite
./vendor/bin/sail npm run dev
```

## Project Structure

```
app/
├── Http/Controllers/     # API controllers
├── Models/               # Eloquent models
├── Policies/             # Authorization policies
└── Http/Requests/        # Form validation

resources/js/
├── pages/                # Inertia page components
├── components/
│   ├── ui/               # shadcn/vue components
│   ├── common/           # Reusable components
│   ├── layout/           # Layout components
│   └── dashboard/        # Feature components
│       └── editor/       # 3D editor components
├── composables/          # Vue 3 composables
├── lib/                  # Utilities
└── owl-sdk.js            # API client

docs/                     # Development documentation
```

## Available Commands

### Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
php artisan serve    # Start Laravel server
```

### Database

```bash
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Reset database
php artisan db:seed              # Seed database
```

### Code Quality

```bash
./vendor/bin/pint               # PHP code style (Laravel Pint)
npm run lint                    # ESLint
```

### API Documentation

```bash
php artisan scribe:generate     # Generate API docs
```

Visit `/docs` to view the API documentation.

## Data Model

```
User
 └── Project
      └── Scene
           ├── Image (panoramic photo)
           │    ├── Hotspot (navigation to another image)
           │    └── Sticker (annotation)
           └── Hotspot (links images within scene)
```

- **Project** - Container for a virtual tour
- **Scene** - Grouping of images (e.g., a room, floor, building)
- **Image** - 360° equirectangular panoramic photo
- **Hotspot** - Navigation link between two images with 3D position
- **Sticker** - Text or emoji annotation on an image

## Usage

### Creating a Virtual Tour

1. **Create a Project** - Give your tour a name and optional cover image
2. **Add Scenes** - Organize your panoramas by location
3. **Upload Images** - Add 360° equirectangular photos (2:1 aspect ratio)
4. **Open Editor** - Click on an image to enter the 3D editor
5. **Add Hotspots** - Switch to Edit mode, click on the panorama to place hotspots
6. **Link Images** - Select target image and set the arrival camera angle
7. **Preview** - Switch to View mode to test navigation

### Image Requirements

- Format: JPEG, PNG, or WebP
- Aspect ratio: 2:1 (equirectangular projection)
- Recommended resolution: 4096x2048 or higher
- Maximum file size: 50MB

## Documentation

Detailed development documentation is available in the `docs/` folder:

- [Architecture Overview](docs/01-architecture-overview.md)
- [Backend Standards](docs/02-backend-standards.md)
- [Frontend Standards](docs/03-frontend-standards.md)
- [API Communication](docs/04-api-communication.md)
- [Components Guide](docs/05-components-guide.md)
- [Composables Reference](docs/06-composables-reference.md)
- [Form Handling](docs/07-form-handling.md)
- [Error Handling](docs/08-error-handling.md)
- [3D Rendering](docs/09-3d-rendering.md)

## API

The API uses slug-based routing with UUID identifiers.

### Authentication

```bash
POST /login          # Session login
POST /api/token      # Get API token
```

### Main Endpoints

```bash
GET    /projects                    # List projects
POST   /projects                    # Create project
GET    /projects/{slug}             # Get project
DELETE /projects/{slug}             # Delete project

GET    /projects/{slug}/scenes      # List scenes
POST   /projects/{slug}/scenes      # Create scene

POST   /scenes/{slug}/images        # Upload image
GET    /images/{slug}               # Get image
DELETE /images/{slug}               # Delete image

POST   /scenes/{slug}/hotspots      # Create hotspot
DELETE /hotspots/{slug}             # Delete hotspot
```

Full API documentation available at `/docs` when running the application.

## Contributing

1. Follow the patterns documented in `docs/`
2. Use existing composables - don't reinvent the wheel
3. All API calls through `owl-sdk.js`
4. Never hardcode values - use `editorConstants.js`
5. Test your changes manually before submitting

## License

Proprietary - All rights reserved.

---

Built by Anulax
