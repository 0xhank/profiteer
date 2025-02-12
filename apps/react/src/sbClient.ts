import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

const supabaseUrl = "https://bkpqenquwivuilvrihip.supabase.co";
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcHFlbnF1d2l2dWlsdnJpaGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDExMTAsImV4cCI6MjA1Mzc3NzExMH0.AbQz1GmIjSKiP74m2xa7jCjaIUfygHdh5Od34NVZ56k";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Cache for image URLs
const imageUrlCache = new Map<string, string>();

// Upload file using standard upload
export async function uploadFile(id: string, file: File) {
    try {
        const { data, error } = await supabase.storage
            .from("images")
            .upload(`${id}.png`, file);

        if (error) {
            console.error("Upload error:", error.message);
            throw error;
        }
        return data.path;
    } catch (e) {
        console.error("Storage error during upload:", e);
        throw e;
    }
}

export async function updateHeadline(
    id: number,
    content: string,
    image_id: string | null
) {
    const { data, error } = await supabase
        .from("news_story")
        .update({ content, image_id })
        .eq("id", id);
    if (error) {
        console.error(error);
        throw error;
    }
    return data;
}

export async function deleteHeadline(id: number) {
    const { error } = await supabase
        .from("news_story")
        .delete()
        .eq("id", id);
    if (error) {
        console.error(error);
        throw error;
    }
}

export async function getHeadlineList(limit: number = 10, start: number = 0) {
    const { data, error } = await supabase
        .from("news_story")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)
        .range(start, start + limit);
    if (error) {
        console.error(error);
        throw error;
    }

    // Get images for articles that have image_url
    const articlesWithImages = await Promise.all(
        data.map(async (article) => {
            let imageUrl: string | null = null;
            if (article.image_id) {
                imageUrl = await getImage(article.image_id);
            }
            return { ...article, imageUrl };
        })
    );

    return articlesWithImages;
}

export async function getHeadline(id: number) {
    const { data, error } = await supabase
        .from("news_story")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function getRelatedHeadlines(topics: string[], limit: number = 10) {
    const { data, error } = await supabase
        .from("news_story")
        .select("*")
        .contains("article_names", topics)
        .limit(limit);

    if (error) {
        console.error(error);
        throw error;
    }

    // Get images for articles that have image_url
    const articlesWithImages = await Promise.all(
      data.map(async (article) => {
          let imageUrl: string | null = null;
          if (article.image_id) {
              imageUrl = await getImage(article.image_id);
          }
          return { ...article, imageUrl };
      })
  );

    return articlesWithImages;
}

export async function getImage(id: string) {
    // Check cache first
    const cachedUrl = imageUrlCache.get(id);
    if (cachedUrl) return cachedUrl;

    try {
        const {
            data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(id);

        const fullUrl = `${publicUrl}.png`;
        imageUrlCache.set(id, fullUrl); // Cache the URL
        return fullUrl;
    } catch (e) {
        console.error("Storage error while getting public URL:", e);
        throw e;
    }
}

export async function getTokenDataFromTopic(topic: string) {
    const { data, error } = await supabase
        .from("token_metadata")
        .select("*")
        .eq("name", topic)
        .single();
    if (error) {
        console.error(error);
        return null;
    }
    return data;
}

export default supabase;
