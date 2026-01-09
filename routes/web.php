<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('/login', function () {
    return Inertia::render('auth/Login');
})->name('welcome');

Route::get('/register', function () {
    return Inertia::render('auth/Register');
})->name('welcome');

Route::get('/docs', function () {
    return view('scribe.index');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard/settings', [DashboardController::class, 'settings'])->name('dashboard.settings');
