// We're importing supabase from the services folder to unify the clients
// This ensures we only have one Supabase instance across the entire app
import { supabase } from './services/supabase';

// Re-export for backward compatibility with existing imports
export { supabase }; 