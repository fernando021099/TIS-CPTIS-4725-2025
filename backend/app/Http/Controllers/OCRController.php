<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use thiagoalessio\TesseractOCR\TesseractOCR;

class OCRController extends Controller
{
    public function procesarImagen(Request $request)
    {
        $request->validate([
            'imagen' => 'required|image'
        ]);

        $path = $request->file('imagen')->store('ocr', 'public');
        $fullPath = storage_path('app/public/' . $path);

        $texto = (new TesseractOCR($fullPath))->run();

        return response()->json(['texto' => $texto]);
    }
}
