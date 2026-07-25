import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gaseaioxmxbrtarhjhdq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_N4v19HtPZzypJsnQ0AS5sQ_SB4tSs9U' 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)