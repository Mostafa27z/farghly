<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanManagementController extends Controller
{
    /**
     * Display listing of all subscription plans.
     */
    public function index(): Response
    {
        $plans = Plan::orderBy('sort_order')->orderBy('id')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'display_name' => $plan->display_name,
                'description' => $plan->description,
                'monthly_videos_limit' => $plan->monthly_videos_limit,
                'monthly_recording_minutes_limit' => $plan->monthly_recording_minutes_limit,
                'monthly_minutes_limit' => $plan->monthly_minutes_limit,
                'price' => (float) $plan->price,
                'max_team_members' => $plan->max_team_members,
                'is_active' => (bool) $plan->is_active,
                'sort_order' => $plan->sort_order,
                'created_at' => $plan->created_at?->format('Y-m-d'),
            ];
        });

        $tenantCounts = Tenant::groupBy('plan_name')
            ->selectRaw('plan_name, count(*) as count')
            ->pluck('count', 'plan_name')
            ->toArray();

        return Inertia::render('admin/plans', [
            'plans' => $plans,
            'tenantCounts' => $tenantCounts,
        ]);
    }

    /**
     * Store a newly created plan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:80|unique:plans,name',
            'display_name' => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'monthly_videos_limit' => 'required|integer|min:1|max:100000',
            'monthly_recording_minutes_limit' => 'required|integer|min:0|max:500000',
            'price' => 'required|numeric|min:0|max:100000',
            'max_team_members' => 'nullable|integer|min:1|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'اسم الباقة التعريفي (Slug) مطلوب.',
            'name.unique' => 'اسم الباقة هذا مستخدم بالفعل.',
            'display_name.required' => 'اسم الباقة الظاهر مطلوب.',
            'monthly_videos_limit.required' => 'رصيد الفيديوهات الشهري مطلوب.',
            'monthly_recording_minutes_limit.required' => 'رصيد دقائق التسجيل الصوتي مطلوب.',
            'price.required' => 'السعر مطلوب.',
        ]);

        $validated['monthly_minutes_limit'] = ((int) $validated['monthly_videos_limit']) * 20;
        $validated['max_team_members'] = $validated['max_team_members'] ?? 5;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['is_active'] = $request->boolean('is_active', true);

        Plan::create($validated);

        return back()->with('success', 'تم إنشاء الباقة الجديدة بنجاح وإتاحتها لفريق المبيعات!');
    }

    /**
     * Update an existing plan.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
            'monthly_videos_limit' => 'required|integer|min:1|max:100000',
            'monthly_recording_minutes_limit' => 'required|integer|min:0|max:500000',
            'price' => 'required|numeric|min:0|max:100000',
            'max_team_members' => 'nullable|integer|min:1|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ], [
            'display_name.required' => 'اسم الباقة الظاهر مطلوب.',
            'monthly_videos_limit.required' => 'رصيد الفيديوهات الشهري مطلوب.',
            'monthly_recording_minutes_limit.required' => 'رصيد دقائق التسجيل الصوتي مطلوب.',
            'price.required' => 'السعر مطلوب.',
        ]);

        $validated['monthly_minutes_limit'] = ((int) $validated['monthly_videos_limit']) * 20;
        $validated['max_team_members'] = $validated['max_team_members'] ?? 5;
        $validated['is_active'] = $request->boolean('is_active', true);

        $plan->update($validated);

        return back()->with('success', "تم تحديث بيانات باقة «{$plan->display_name}» بنجاح!");
    }

    /**
     * Toggle plan active status.
     */
    public function toggle(Plan $plan)
    {
        $plan->update(['is_active' => !$plan->is_active]);

        $status = $plan->is_active ? 'تفعيل' : 'إلغاء تفعيل';
        return back()->with('success', "تم {$status} باقة «{$plan->display_name}» بنجاح.");
    }

    /**
     * Delete a plan if no tenants are actively subscribed to it.
     */
    public function destroy(Plan $plan)
    {
        $isUsed = Tenant::where('plan_name', $plan->name)->exists();
        if ($isUsed) {
            return back()->withErrors([
                'error' => "لا يمكن حذف باقة «{$plan->display_name}» لأن هناك مشتركون مسجلون بها حالياً. يمكنك تعطيلها بدلاً من حذفها.",
            ]);
        }

        $plan->delete();

        return back()->with('success', "تم حذف الباقة بنجاح.");
    }
}
