<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Preview Generation
    |--------------------------------------------------------------------------
    |
    | Controls how lightweight preview images are generated from originals.
    | The scale_factor is applied to both width and height of the original
    | image to produce the preview dimensions.
    |
    */

    'preview' => [
        'scale_factor' => env('IMAGE_PREVIEW_SCALE', 0.25),
        'quality' => env('IMAGE_PREVIEW_QUALITY', 70),
    ],

];
