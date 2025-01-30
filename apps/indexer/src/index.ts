// #!/usr/bin/env node

import supabase from "./sbclient";

/* --------------------------------- START --------------------------------- */
export const start = async () => {
  while (true) {
    console.log("Hello");

    // Insert current time into the table
    const { data: insertData, error: insertError } = await supabase
      .from("test_timestamp")
      .insert([{ recent_time: new Date().toISOString() }]);

    if (insertError) {
      console.error("Insert Error:", insertError);
    } else {
      console.log("Inserted Data:", insertData);
    }

    const { data, error } = await supabase
      .from("test_timestamp")
      .select("*")
      .eq("id", 1);
    console.log(data, error);
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
};
