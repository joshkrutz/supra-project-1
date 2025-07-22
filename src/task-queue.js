export default class TaskQueue {
  constructor() {
    this.taskQueue = [];
    this.timingQueue = [];
    this.isRunning = false;
    this.API_CALL_LIMIT = 10;
    this.API_TIME_LIMIT_IN_MS = 15000;
    this.NUM_RETRIES = 5;
    this.retryNumber = 0;
  }

  async #run() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.taskQueue.length > 0) {
      const now = Date.now();

      // Clean up old API call timestamps
      this.timingQueue = this.timingQueue.filter(
        (t) => now - t < this.API_TIME_LIMIT_IN_MS
      );

      if (this.timingQueue.length >= this.API_CALL_LIMIT) {
        const waitTime =
          this.API_TIME_LIMIT_IN_MS - (now - this.timingQueue[0]);
        console.log(`[WARN] API limit hit. Waiting ${waitTime / 1000}s`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }

      const task = this.taskQueue[0];

      const success = await task();
      if (success) {
        this.taskQueue.shift();
        this.timingQueue.push(Date.now());
        this.retryNumber = 0;
      } else {
        console.warn("[WARN] Task failed, will retry...");
        if (this.retry()) {
          await new Promise((r) => setTimeout(r, this.API_TIME_LIMIT_IN_MS));
          continue;
        }
        console.error("[WARN] Task failed after successive retry attempts");
        this.retryNumber = 0;
        this.isRunning = false;
        this.taskQueue = [];
        this.timingQueue = [];
        return;
      }
    }

    this.isRunning = false;
  }

  addTask(task) {
    this.taskQueue.push(task);
    this.#run();
  }

  retry() {
    console.log(
      `[LOG] Retrying last task after ${
        this.API_TIME_LIMIT_IN_MS / 1000
      } second delay... Attempt ${++this.retryNumber}/${this.NUM_RETRIES}`
    );
    return this.retryNumber < this.NUM_RETRIES;
  }

  async waitForAvailableSlot() {
    const now = Date.now();

    this.timingQueue = this.timingQueue.filter(
      (t) => now - t < this.API_TIME_LIMIT_IN_MS
    );

    if (this.timingQueue.length < this.API_CALL_LIMIT) {
      return;
    }

    const waitTime = this.API_TIME_LIMIT_IN_MS - (now - this.timingQueue[0]);
    console.log(
      `[LOG] Waiting ${Math.ceil(waitTime / 1000)}s for available slot...`
    );
    await new Promise((r) => setTimeout(r, waitTime));
  }
}
