<?php

namespace App\Http\Controllers;

use App\Models\Sticker;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StickerController extends Controller
{
    public function index(Image $image)
    {
        $this->authorize('view', $image->scene->project);
        
        $stickers = $image->stickers;
        
        return response()->json([
            'success' => true,
            'data' => $stickers
        ]);
    }

    public function store(Request $request, Image $image)
    {
        $this->authorize('update', $image->scene->project);
        
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:emoji,image,text',
            'content' => 'required|string',
            'position_x' => 'required|numeric',
            'position_y' => 'required|numeric',
            'position_z' => 'required|numeric',
            'text_color' => 'nullable|string',
            'text_size' => 'nullable|integer|min:8|max:72',
            'text_font' => 'nullable|string',
            'scale' => 'nullable|numeric|min:0.1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $sticker = $image->stickers()->create($validator->validated());

        return response()->json([
            'success' => true,
            'data' => $sticker
        ], 201);
    }

    public function show(Sticker $sticker)
    {
        $this->authorize('view', $sticker->image->scene->project);
        
        return response()->json([
            'success' => true,
            'data' => $sticker
        ]);
    }

    public function update(Request $request, Sticker $sticker)
    {
        $this->authorize('update', $sticker->image->scene->project);
        
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:emoji,image,text',
            'content' => 'sometimes|string',
            'position_x' => 'sometimes|numeric',
            'position_y' => 'sometimes|numeric',
            'position_z' => 'sometimes|numeric',
            'text_color' => 'nullable|string',
            'text_size' => 'nullable|integer|min:8|max:72',
            'text_font' => 'nullable|string',
            'scale' => 'nullable|numeric|min:0.1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $sticker->update($validator->validated());

        return response()->json([
            'success' => true,
            'data' => $sticker
        ]);
    }

    public function destroy(Sticker $sticker)
    {
        $this->authorize('delete', $sticker->image->scene->project);
        
        $sticker->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sticker deleted successfully'
        ]);
    }
}