<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:super-admin 
                            {email : The email address of the super admin} 
                            {password : The account password} 
                            {--name=Super Admin : Name for the super admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update a Super Admin user with password and full privileges';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = trim($this->argument('email'));
        $password = $this->argument('password');
        $name = $this->option('name') ?: 'Super Admin';

        $user = User::firstOrNew(['email' => $email]);

        if (!$user->exists || ($this->option('name') && $this->option('name') !== 'Super Admin')) {
            $user->name = $name;
        }

        $user->password = Hash::make($password);
        $user->system_role = 'super_admin';
        $user->is_active = true;
        $user->save();

        $action = $user->wasRecentlyCreated ? 'Created new' : 'Updated existing';

        $this->info("✓ {$action} Super Admin successfully!");
        $this->table(
            ['ID', 'Name', 'Email', 'Role', 'Status'],
            [[$user->id, $user->name, $user->email, $user->system_role, $user->is_active ? 'Active' : 'Inactive']]
        );

        return 0;
    }
}
