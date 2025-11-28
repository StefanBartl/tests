// Create a simple counter and an executor that resolves immediately.
// This demonstrates that the executor runs synchronously when a new Promise is created.
let count = 0;

const executor = (
  resolved /* (value: string) => void */,
  rejected /* (reason?: any) => void */,
) => {
  try {
    // Increment the counter synchronously when the Promise is constructed.
    count += 1;
    // Resolve with a string containing the current count.
    resolved(`Neuer Wert: ${count}`);
  } catch (error) {
    // If something goes wrong, cast and reject with the message.
    const e = /** @type {NodeJS.ErrnoException} */ (error);
    rejected(e && e.message ? e.message : String(error));
  }
};

// Construct four promises — executor runs immediately for each.
const myPromise1 = new Promise(executor);
const myPromise2 = new Promise(executor);
const myPromise3 = new Promise(executor);
const myPromise4 = new Promise(executor);

// Use Promise.all to wait for all of them.
// The resulting array preserves the order of the input promises.
Promise.all([myPromise1, myPromise2, myPromise3, myPromise4])
  .then((results) => {
    // results is ["Neuer Wert: 1", "Neuer Wert: 2", "Neuer Wert: 3", "Neuer Wert: 4"]
    console.log("All resolved:", results);
  })
  .catch((err) => {
    // If any promise had rejected, this branch would run with the first rejection reason.
    console.error("At least one promise rejected:", err);
  });

// Example: if one promise rejects, Promise.all rejects immediately.
// Here is a variant that demonstrates rejection.
const badExecutor = (resolve, reject) => {
  count += 1;
  if (count === 3) {
    // Simulate a failure for the third created promise.
    reject(new Error("Simulated failure at count 3"));
    return;
  }
  resolve(`Good: ${count}`);
};

const p1 = new Promise(badExecutor);
const p2 = new Promise(badExecutor);
const p3 = new Promise(badExecutor); // this will reject
const p4 = new Promise(badExecutor);

Promise.all([p1, p2, p3, p4])
  .then((res) => {
    console.log("Should not get here when one rejects:", res);
  })
  .catch((err) => {
    // This will log the rejection from p3.
    console.error("Promise.all rejected because one promise failed:", err.message);
  });

// If the goal is to wait for all promises and collect both fulfilled and rejected outcomes,
// use Promise.allSettled which returns an array of outcome objects for every input promise.
Promise.allSettled([p1, p2, p3, p4]).then((outcomes) => {
  // Each outcome is { status: "fulfilled", value: ... } or { status: "rejected", reason: ... }
  console.log("All settled outcomes:", outcomes);
});
