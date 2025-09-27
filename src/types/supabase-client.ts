import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>