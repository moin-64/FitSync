
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlvaytsqqlzfprphvgll.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdmF5dHNxcWx6ZnBycGh2Z2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NzMxNDYsImV4cCI6MjA1OTE0OTE0Nn0.q-ndRrgUZpvGVutBa-FDXEb8_IOnH0RRvKfXNTkvQB4';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
