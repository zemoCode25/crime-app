import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/server/supabase/database.types'

export type TypedSupabaseClient = SupabaseClient<Database>