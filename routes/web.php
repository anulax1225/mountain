<?php

use App\Http\Controllers\AdminContactRequestController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChunkedUploadController;
use App\Http\Controllers\ContactRequestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\HotspotController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectUserController;
use App\Http\Controllers\SceneController;
use App\Http\Controllers\StickerController;
use App\Http\Controllers\Web\DashboardController as WebDashboardController;
use App\Http\Controllers\Web\ProjectController as WebProjectController;
use App\Http\Controllers\Web\SceneController as WebSceneController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/login', function () {
    return Inertia::render('auth/Login');
})->name('login');

Route::get('/pricing', function () {
    return Inertia::render('Pricing');
})->name('pricing');

// Public contact page
Route::get('/contact', [ContactRequestController::class, 'show'])->name('contact');
Route::post('/api/contact', [ContactRequestController::class, 'store']);

Route::post('/login', [AuthController::class, 'webLogin']);

Route::post('/api/login', [AuthController::class, 'login']);

// Invitation registration routes
Route::get('/register/invitation/{token}', [AuthController::class, 'showInvitationForm'])->name('register.invitation');
Route::post('/register/invitation/{token}', [AuthController::class, 'completeInvitation'])->name('register.invitation.complete');

Route::get('/docs', function () {
    return view('scribe.index');
});

// Public gallery routes
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');
Route::get('/gallery/{project:slug}', [GalleryController::class, 'show'])
    ->middleware('allow-iframe')
    ->name('gallery.show');

// Public analytics tracking (no auth required)
Route::post('/analytics/track', [AnalyticsController::class, 'track']);

Route::middleware(['auth'])->group(function () {
    // Web dashboard routes (Inertia with props)
    Route::get('/dashboard', [WebDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/settings', [WebDashboardController::class, 'settings'])->name('dashboard.settings');
    Route::post('/dashboard/projects', [WebDashboardController::class, 'storeProject'])->name('web.projects.store');
    Route::post('/dashboard/projects/{project:slug}', [WebDashboardController::class, 'updateProject'])->name('web.projects.update');
    Route::delete('/dashboard/projects/{project:slug}', [WebDashboardController::class, 'destroyProject'])->name('web.projects.destroy');

    // Web project routes (Inertia with props)
    Route::get('/dashboard/projects/{project:slug}', [WebProjectController::class, 'show'])->name('dashboard.project');
    Route::post('/dashboard/projects/{project:slug}/edit', [WebProjectController::class, 'update'])->name('web.project.update');
    Route::post('/dashboard/projects/{project:slug}/make-public', [WebProjectController::class, 'makePublic'])->name('web.project.make-public');
    Route::post('/dashboard/projects/{project:slug}/scenes', [WebProjectController::class, 'storeScene'])->name('web.project.scenes.store');
    Route::post('/dashboard/scenes/{scene:slug}/edit', [WebProjectController::class, 'updateScene'])->name('web.scenes.update');
    Route::delete('/dashboard/scenes/{scene:slug}', [WebProjectController::class, 'destroyScene'])->name('web.scenes.destroy');
    Route::post('/dashboard/projects/{project:slug}/users', [WebProjectController::class, 'assignUser'])->name('web.project.users.store');
    Route::delete('/dashboard/projects/{project:slug}/users/{user}', [WebProjectController::class, 'removeUser'])->name('web.project.users.destroy');

    // Legacy dashboard routes (still using old controller until converted)
    Route::get('/dashboard/admin/users', [DashboardController::class, 'adminUsers'])->name('dashboard.admin.users');
    Route::get('/dashboard/admin/contact-requests', [AdminContactRequestController::class, 'index'])->name('dashboard.admin.contact-requests');
    Route::get('/dashboard/projects/{project:slug}/analytics', [DashboardController::class, 'showProjectAnalytics'])->name('dashboard.project.analytics');
    Route::get('/dashboard/scenes/{scene:slug}', [WebSceneController::class, 'show'])->name('dashboard.scene');
    Route::delete('/dashboard/images/{image:slug}', [WebSceneController::class, 'destroyImage'])->name('web.images.destroy');
    Route::get('/dashboard/editor/{project:slug}', [DashboardController::class, 'showEditor'])->name('dashboard.editor');
});

// Protected routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'webLogout']);
    Route::post('/api/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Your existing authenticated routes here...
});

Route::get('/images/{image:slug}/download', [ImageController::class, 'download']);
Route::get('/projects/{project:slug}/picture', [ProjectController::class, 'downloadPicture']);

Route::middleware('auth')->group(function () {

    // Admin routes (user management)
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::get('/admin/roles', [AdminUserController::class, 'roles']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{user}/role', [AdminUserController::class, 'updateRole']);
    Route::post('/admin/users/{user}/resend-invitation', [AdminUserController::class, 'resendInvitation']);
    Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy']);

    // Admin routes (contact requests management)
    Route::get('/admin/contact-requests', [AdminContactRequestController::class, 'list']);
    Route::get('/admin/contact-requests/{contactRequest:slug}', [AdminContactRequestController::class, 'show']);
    Route::put('/admin/contact-requests/{contactRequest:slug}', [AdminContactRequestController::class, 'update']);
    Route::delete('/admin/contact-requests/{contactRequest:slug}', [AdminContactRequestController::class, 'destroy']);

    // Projects routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project:slug}', [ProjectController::class, 'show']);
    Route::put('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::patch('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project:slug}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{project:slug}/make-public', [ProjectController::class, 'makePublic']);
    Route::get('/projects/{project:slug}/images', [ProjectController::class, 'getImages']);
    Route::get('/projects/{slug}/analytics', [AnalyticsController::class, 'getProjectAnalytics']);

    // Project user assignment routes
    Route::get('/projects/{project:slug}/users', [ProjectUserController::class, 'index']);
    Route::post('/projects/{project:slug}/users', [ProjectUserController::class, 'store']);
    Route::delete('/projects/{project:slug}/users/{user}', [ProjectUserController::class, 'destroy']);
    Route::get('/available-users', [ProjectUserController::class, 'availableUsers']);
    Route::get('/available-roles', [ProjectUserController::class, 'availableRoles']);

    // Scenes routes (nested under projects)
    Route::get('/projects/{project:slug}/scenes', [SceneController::class, 'index']);
    Route::post('/projects/{project:slug}/scenes', [SceneController::class, 'store']);
    Route::get('/scenes/{scene:slug}', [SceneController::class, 'show']);
    Route::put('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::patch('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::delete('/scenes/{scene:slug}', [SceneController::class, 'destroy']);

    // Chunked upload routes (S3 staging)
    Route::post('/uploads/direct', [ChunkedUploadController::class, 'directUpload']);
    Route::post('/uploads/initiate', [ChunkedUploadController::class, 'initiate']);
    Route::post('/uploads/part', [ChunkedUploadController::class, 'uploadPart']);
    Route::post('/uploads/complete', [ChunkedUploadController::class, 'complete']);
    Route::post('/uploads/abort', [ChunkedUploadController::class, 'abort']);

    // Images routes (nested under scenes)
    Route::get('/scenes/{scene:slug}/images', [ImageController::class, 'index']);
    Route::post('/scenes/{scene:slug}/images', [ImageController::class, 'store']);
    Route::get('/images/{image:slug}', [ImageController::class, 'show']);
    Route::post('/images/{image:slug}', [ImageController::class, 'update']); // POST for file uploads
    Route::delete('/images/{image:slug}', [ImageController::class, 'destroy']);

    // Hotspots routes (nested under scenes)
    Route::get('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'index']);
    Route::post('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'store']);
    Route::get('/hotspots/{hotspot:slug}', [HotspotController::class, 'show']);
    Route::put('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::patch('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::delete('/hotspots/{hotspot:slug}', [HotspotController::class, 'destroy']);

    // Stickers routes (nested under images)
    Route::get('/images/{image:slug}/stickers', [StickerController::class, 'index']);
    Route::post('/images/{image:slug}/stickers', [StickerController::class, 'store']);
    Route::get('/stickers/{sticker:slug}', [StickerController::class, 'show']);
    Route::put('/stickers/{sticker:slug}', [StickerController::class, 'update']);
    Route::patch('/stickers/{sticker:slug}', [StickerController::class, 'update']);
    Route::delete('/stickers/{sticker:slug}', [StickerController::class, 'destroy']);
});
