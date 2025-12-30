import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xhycfszagszwquckhqly.supabase.co'
const supabaseAnonKey = 'sb_publishable_WkXfZGW0Rroc5ZLkuN0-hw_lXgstbJM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
