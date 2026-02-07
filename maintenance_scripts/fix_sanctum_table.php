<?php

/**
 * Create personal_access_tokens table for Sanctum
 * Run this once to fix 401 authentication errors
 */

// Load Laravel bootstrap
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    // Check if table already exists
    if (Schema::hasTable('personal_access_tokens')) {
        echo "✓ Table 'personal_access_tokens' already exists.\n";
    } else {
        // Create the table
        DB::statement("
            CREATE TABLE personal_access_tokens (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                tokenable_type VARCHAR(255) NOT NULL,
                tokenable_id BIGINT UNSIGNED NOT NULL,
                name VARCHAR(255) NOT NULL,
                token VARCHAR(64) NOT NULL,
                abilities TEXT NULL,
                last_used_at TIMESTAMP NULL,
                expires_at TIMESTAMP NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                UNIQUE KEY personal_access_tokens_token_unique (token),
                INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✓ Table 'personal_access_tokens' created successfully!\n";
    }

    // Verify table exists now
    $tables = DB::select("SHOW TABLES LIKE 'personal_access_tokens'");
    if (count($tables) > 0) {
        echo "✓ Verification: Table exists and is ready.\n";
        echo "\nAuthentication should now work. Please test the application.\n";
    } else {
        echo "✗ Error: Table was not created.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
