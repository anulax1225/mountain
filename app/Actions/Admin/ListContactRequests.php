<?php

namespace App\Actions\Admin;

use App\Models\ContactRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListContactRequests
{
    public function __invoke(?string $status = null, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = ContactRequest::query()->orderBy('created_at', 'desc');

        if ($status && in_array($status, ['received', 'in_process', 'refused', 'validated'])) {
            $query->where('status', $status);
        }

        if ($search && ! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }
}
