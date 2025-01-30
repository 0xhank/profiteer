// #!/usr/bin/env node

/* --------------------------------- START --------------------------------- */
export const start = async () => {
  while (true) {
      console.log("Hello");
      await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
};
