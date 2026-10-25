<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteUserRoleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:role {email : The email address of the user} {role=super_admin : The role to assign (super_admin, sales, client)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign a system role (super_admin, sales, client) to a user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        $role = strtolower($this->argument('role'));

        if (!in_array($role, ['super_admin', 'sales', 'client'])) {
            $this->error("Invalid role '{$role}'. Supported roles: super_admin, sales, client.");
            return 1;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return 1;
        }

        $user->update([
            'system_role' => $role,
            'is_active' => true,
        ]);

        $this->info("Successfully assigned role '{$role}' to user {$user->name} ({$user->email}).");

        return 0;
    }
}
