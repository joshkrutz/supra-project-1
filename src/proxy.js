import express from "express";
import cors from "cors";
import TaskQueue from "./task-queue.js";

const app = express();
const PORT = 3000;

app.use(cors());

let taskQueue = new TaskQueue();
let cachedIndexList;
let nextIdx = 0;

const loadCache = () => {
  const apiUrl =
    "https://collectionapi.metmuseum.org/public/collection/v1/search?q=a&hasImages=true";

  return taskQueue.addTask(
    () =>
      new Promise(async (resolve) => {
        try {
          console.log("[LOG] Loading index list from Met API...");
          const res = await fetch(apiUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
              Accept: "application/json",
              "Accept-Language": "en-US,en;q=0.9",
              Referer: "https://www.metmuseum.org/",
            },
          });

          if (!res.ok)
            throw new Error("Bad response. Maybe you exceeded API limit?");

          const data = await res.json();
          if (!data.objectIDs?.length) throw new Error("No object IDs");

          cachedIndexList = data;
          nextIdx = 0;
          console.log(`[LOG] Cached ${data.objectIDs.length} objects`);
          resolve(true);
        } catch (err) {
          console.error("[WARN] Failed to load cache:", err.message);
          resolve(false);
        }
      })
  );
};

app.get("/nextArt", async (req, res) => {
  // Ensure we load cacheIndex onto the queue before the our task
  if (!cachedIndexList?.objectIDs?.length) {
    console.log("[WARN] Cache missing. Requesting download.");
    loadCache();
  }

  taskQueue.addTask(async () => {
    const total = cachedIndexList.objectIDs.length;

    while (nextIdx < total) {
      const id = cachedIndexList.objectIDs[nextIdx++];
      const apiUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.9",
            Referer: "https://www.metmuseum.org/",
          },
        });

        if (response.status === 404) {
          console.warn(`[WARN] ID ${id} not found (404) — skipping`);
          continue;
        }

        const data = await response.json();

        if (!data.primaryImage) {
          console.warn(`[WARN] ID ${id} has no image — skipping`);
          continue;
        }

        console.log(`[LOG] Served object ID ${id}`);
        res.json(data);
        return true;
      } catch (err) {
        console.warn(
          `[WARN] ID ${id} returned non-JSON response (possible rate limit)`
        );
        return false;
      }
    }

    res.status(404).json({ error: "No more art to show." });
  });
});

app.listen(PORT, () => {
  console.log(`[LOG] Proxy server running at http://localhost:${PORT}`);
});
