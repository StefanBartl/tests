"use strict";
// index.ts
// This file demonstrates a corrected Promise usage in TypeScript.
// Comments are in English as requested; code uses proper typings and setTimeout usage.
/*
  Create a Promise that resolves to a string.
  - Use the Promise generic to declare the resolved value type.
  - Use `string` (primitive) not `String` (wrapper object).
*/
const myP = new Promise((resolve, reject) => {
    try {
        // Correct placement of the delay argument to setTimeout.
        // The arrow callback calls resolve with the string value.
        setTimeout(() => {
            resolve("resolved");
        }, 300);
    }
    catch (error) {
        // If something unexpected throws synchronously, reject with a string.
        reject("rejected");
    }
});
// Use the promise
myP.then((solved) => {
    // solved is typed as string
    console.log(solved);
}).catch((err) => {
    console.error("promise rejected:", err);
});
