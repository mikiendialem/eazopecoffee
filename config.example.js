// config.example.js
// Copy this file to "config.js" and fill in your own Supabase project
// values. config.js is listed in .gitignore and will NOT be committed.
//
// Note: the Supabase anon/public key IS safe to expose in client-side
// code as long as Row Level Security (RLS) policies are set up correctly
// on your tables (see database.sql). It is NOT a secret like the
// service_role key, which must never appear in frontend code.

window.EAZOPE_CONFIG = {
    SUPABASE_URL: "https://YOUR-PROJECT-REF.supabase.co",
    SUPABASE_ANON_KEY: "your-anon-public-key-here"
};
