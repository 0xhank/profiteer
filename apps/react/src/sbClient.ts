import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

const supabaseUrl = "https://bkpqenquwivuilvrihip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcHFlbnF1d2l2dWlsdnJpaGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDExMTAsImV4cCI6MjA1Mzc3NzExMH0.AbQz1GmIjSKiP74m2xa7jCjaIUfygHdh5Od34NVZ56k";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Upload file using standard upload
export async function uploadFile(id: string, file: File) {
  try {
    const { data, error } = await supabase.storage.from('images').upload(`${id}.png`, file, {
      upsert: true // Add upsert option to handle existing files
    });
    
    if (error) {
      console.error('Upload error:', error.message, error.details);
      throw error;
    }
    return data.path;
  } catch (e) {
    console.error('Storage error during upload:', e);
    throw e;
  }
}

export async function getArticleList(limit: number = 10) {
  const { data, error } = await supabase.from('news_story').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
}

export async function getArticle(id: number) {
  const { data, error } = await supabase.from('news_story').select('*').eq('id', id).single();
  if (error) {
    console.error(error);
    throw error;
  }
  return data;
}

export async function getImage(id: string) {
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(id);
      
    return `${publicUrl}.png`;
  } catch (e) {
    console.error('Storage error while getting public URL:', e);
    throw e;
  }
}

export default supabase;