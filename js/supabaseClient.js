import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Add your project's URL and anon key from Supabase.
const SUPABASE_URL = "https://aljmqnsulbcrenpbgntq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_x0WxGBVzE3rUPSqBERe6iA_7DyQ2Ldf";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
