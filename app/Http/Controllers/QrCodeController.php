<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class QrCodeController extends Controller
{
    /**
     * Store a QR code verification request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'qrcode' => 'required|string',
        ]);

        $qrCode = $request->input('qrcode');

        // Simple validation logic - in a real app, this would check against a database
        // For demo purposes, we'll consider codes starting with "VALID" as valid
        $isValid = str_starts_with(strtoupper($qrCode), 'VALID');

        return response()->json([
            'status' => $isValid ? 'valid' : 'invalid',
            'message' => $isValid ? 'Ticket valid' : 'Ticket invalid',
        ]);
    }
}