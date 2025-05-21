<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PagoController extends Controller
{
    public function subirComprobante(Request $request)
    {
        $request->validate([
            'comprobante' => 'required|image|max:5120',
            'registrationId' => 'required|string',
        ]);

        if (!$request->hasFile('comprobante')) {
            return response()->json(['message' => 'No se recibió el archivo'], 400);
        }

        $file = $request->file('comprobante');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('comprobantes', $filename, 'public');

        return response()->json([
            'message' => 'Comprobante recibido correctamente',
            'path' => $path,
        ]);
    }
}
