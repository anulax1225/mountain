<?php

namespace App\Http\Controllers;

use Aws\S3\S3Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Str;

class ChunkedUploadController extends Controller
{
    private function s3(): S3Client
    {
        return new S3Client([
            'region' => config('filesystems.disks.s3.region'),
            'version' => 'latest',
            'credentials' => [
                'key' => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
            'endpoint' => config('filesystems.disks.s3.endpoint'),
            'use_path_style_endpoint' => config('filesystems.disks.s3.use_path_style_endpoint', false),
        ]);
    }

    /**
     * Direct upload for small files (≤100MB).
     * Streams the file to the S3 staging area in a single request.
     */
    public function directUpload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file',
        ]);

        $file = $request->file('file');
        $key = 'uploads/'.Str::uuid().'/'.$file->getClientOriginalName();

        $this->s3()->putObject([
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $key,
            'Body' => fopen($file->getRealPath(), 'rb'),
            'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
        ]);

        return response()->json([
            'key' => $key,
            'filename' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType() ?: 'application/octet-stream',
        ]);
    }

    /**
     * Initiate a multipart upload for large files.
     */
    public function initiate(Request $request): JsonResponse
    {
        $request->validate([
            'filename' => 'required|string',
            'content_type' => 'required|string',
        ]);

        $key = 'uploads/'.Str::uuid().'/'.$request->filename;

        $result = $this->s3()->createMultipartUpload([
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $key,
            'ContentType' => $request->content_type,
        ]);

        return response()->json([
            'upload_id' => $result['UploadId'],
            'key' => $key,
        ]);
    }

    /**
     * Upload a single chunk of a multipart upload.
     */
    public function uploadPart(Request $request): JsonResponse
    {
        $request->validate([
            'upload_id' => 'required|string',
            'key' => 'required|string',
            'part_number' => 'required|integer|min:1',
            'chunk' => 'required|file',
        ]);

        $result = $this->s3()->uploadPart([
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $request->key,
            'UploadId' => $request->upload_id,
            'PartNumber' => (int) $request->part_number,
            'Body' => fopen($request->file('chunk')->getRealPath(), 'rb'),
        ]);

        return response()->json([
            'etag' => $result['ETag'],
        ]);
    }

    /**
     * Complete a multipart upload.
     */
    public function complete(Request $request): JsonResponse
    {
        $request->validate([
            'upload_id' => 'required|string',
            'key' => 'required|string',
            'parts' => 'required|array',
            'parts.*.PartNumber' => 'required|integer',
            'parts.*.ETag' => 'required|string',
        ]);

        $result = $this->s3()->completeMultipartUpload([
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $request->key,
            'UploadId' => $request->upload_id,
            'MultipartUpload' => ['Parts' => $request->parts],
        ]);

        return response()->json([
            'url' => $result['Location'],
            'key' => $request->key,
        ]);
    }

    /**
     * Abort a multipart upload on failure.
     */
    public function abort(Request $request): Response
    {
        $this->s3()->abortMultipartUpload([
            'Bucket' => config('filesystems.disks.s3.bucket'),
            'Key' => $request->key,
            'UploadId' => $request->upload_id,
        ]);

        return response()->noContent();
    }
}
