// Remote Supabase Configuration
// Скопируйте эти настройки в ваш .env файл или используйте напрямую в коде

module.exports = {
  // Project details
  projectId: 'qosblydpgejtnyvzctpg',
  projectUrl: 'https://qosblydpgejtnyvzctpg.supabase.co',

  // API Keys - получены из Supabase Dashboard
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDIyNjIsImV4cCI6MjA3NjcxODI2Mn0.NdTiIXBqopSrK1uZb1Bh8MjulTOZE0iyjgNS-Tf_kn8',
  serviceRoleKey: 'your-service-role-key-here',

  // Database connection string
  databaseUrl: 'postgresql://postgres:[password]@db.qosblydpgejtnyvzctpg.supabase.co:5432/postgres',

  // Instructions for getting keys:
  // 1. Go to https://supaeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2JseWRwZ2VqdG55dnpjdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDIyNjIsImV4cCI6MjA3NjcxODI2Mn0.NdTiIXBqopSrK1uZb1Bh8MjulTOZE0iyjgNS-Tf_kn8base.com/dashboard/project/qosblydpgejtnyvzctpg/settings/api
  // 2. Copy "anon public" key to anonKey
  // 3. Copy "service_role" key to serviceRoleKey
  // 4. Update database password in databaseUrl
}
