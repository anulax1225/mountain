<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use Inertia\Inertia;
use App\Http\Controllers\HotspotController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SceneController;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/login', function () {
    return Inertia::render('auth/Login');
})->name('welcome');

Route::get('/register', function () {
    return Inertia::render('auth/Register');
})->name('welcome');

Route::post('/register', [AuthController::class, 'webRegister']);
Route::post('/login', [AuthController::class, 'webLogin']);

Route::post('/api/register', [AuthController::class, 'register']);
Route::post('/api/login', [AuthController::class, 'login']);

Route::get('/docs', function () {
    return view('scribe.index');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/settings', [DashboardController::class, 'settings'])->name('dashboard.settings');
    Route::get('/dashboard/projects/{project:slug}', [DashboardController::class, 'showProject'])->name('dashboard.project');
    Route::get('/dashboard/scenes/{scene:slug}', [DashboardController::class, 'showScene'])->name('dashboard.scene');
});


// Protected routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Your existing authenticated routes here...
});

Route::middleware('auth')->group(function () {
    
    // Projects routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project:slug}', [ProjectController::class, 'show']);
    Route::put('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::patch('/projects/{project:slug}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project:slug}', [ProjectController::class, 'destroy']);
    
    // Scenes routes (nested under projects)
    Route::get('/projects/{project:slug}/scenes', [SceneController::class, 'index']);
    Route::post('/projects/{project:slug}/scenes', [SceneController::class, 'store']);
    Route::get('/scenes/{scene:slug}', [SceneController::class, 'show']);
    Route::put('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::patch('/scenes/{scene:slug}', [SceneController::class, 'update']);
    Route::delete('/scenes/{scene:slug}', [SceneController::class, 'destroy']);
    
    // Images routes (nested under scenes)
    Route::get('/scenes/{scene:slug}/images', [ImageController::class, 'index']);
    Route::post('/scenes/{scene:slug}/images', [ImageController::class, 'store']);
    Route::get('/images/{image:slug}', [ImageController::class, 'show']);
    Route::get('/images/{image:slug}/download', [ImageController::class, 'download']);
    Route::post('/images/{image:slug}', [ImageController::class, 'update']); // POST for file uploads
    Route::delete('/images/{image:slug}', [ImageController::class, 'destroy']);
    
    // Hotspots routes (nested under scenes)
    Route::get('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'index']);
    Route::post('/scenes/{scene:slug}/hotspots', [HotspotController::class, 'store']);
    Route::get('/hotspots/{hotspot:slug}', [HotspotController::class, 'show']);
    Route::put('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::patch('/hotspots/{hotspot:slug}', [HotspotController::class, 'update']);
    Route::delete('/hotspots/{hotspot:slug}', [HotspotController::class, 'destroy']);
});

