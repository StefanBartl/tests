let count = 0;

const executor = (
  resolved: (value: string) => void,
  rejected: (reason?: any) => void,
) => {
  try {
    count += 1;
    resolved(`Neuer Wert: ${count}`);
  } catch (error) {
    const e = /** @type {NodeJS.ErrnoException} */ (error);
    rejected(e && e.message ? e.message : String(error));
  }
};

const myPromise1 = new Promise(executor);
const myPromise2 = new Promise(executor);
const myPromise3 = new Promise(executor);
const myPromise4 = new Promise(executor);

Promise.all([myPromise1, myPromise2, myPromise3, myPromise4])
.then((val) => {
        console.info(val)
    })
.catch((e) => {
        console.error(e)
    })
