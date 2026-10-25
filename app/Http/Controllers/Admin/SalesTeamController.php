<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SalesTeamController extends Controller
{
    /**
     * Display listing of all sales representatives and staff.
     */
    public function index(): Response
    {
        $salesReps = User::whereIn('system_role', ['sales', 'super_admin'])
            ->withCount(['salesTransactions', 'createdTenants'])
            ->latest('created_at')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'system_role' => $user->system_role,
                'is_active' => (bool) $user->is_active,
                'transactions_count' => $user->sales_transactions_count,
                'created_tenants_count' => $user->created_tenants_count,
                'created_at' => $user->created_at->format('Y-m-d'),
                'created_at_human' => $user->created_at->diffForHumans(),
            ]);

        return Inertia::render('admin/sales-team', [
            'salesReps' => $salesReps,
        ]);
    }

    /**
     * Create a new sales team member.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:6|max:64',
            'system_role' => 'required|string|in:sales,super_admin',
        ], [
            'name.required' => 'اسم الموظف مطلوب.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.unique' => 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'system_role' => $request->input('system_role', 'sales'),
            'is_active' => true,
        ]);

        return redirect()->route('admin.sales-team.index')->with(
            'success',
            "تم إنشاء حساب الموظف «{$user->name}» وتعيين دوره كـ " . ($user->system_role === 'super_admin' ? 'مدير عام' : 'مندوب مبيعات') . " بنجاح!"
        );
    }

    /**
     * Toggle active status of a sales representative.
     */
    public function toggleStatus(Request $request, User $user)
    {
        // Prevent disabling yourself
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['error' => 'لا يمكنك تعطيل حسابك الشخصي.']);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $statusText = $user->is_active ? 'تفعيل' : 'إيقاف وتعطيل';
        return back()->with('success', "تم {$statusText} حساب الموظف «{$user->name}» بنجاح.");
    }

    /**
     * Reset password for a sales representative.
     */
    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|string|min:6|max:64',
        ], [
            'password.required' => 'كلمة المرور الجديدة مطلوبة.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
        ]);

        $user->update([
            'password' => Hash::make($request->input('password')),
        ]);

        return back()->with('success', "تم تغيير كلمة المرور للموظف «{$user->name}» بنجاح.");
    }
}
