// benchmark.js
const { performance } = require("perf_hooks");
const quicksort4 = require("@alvarocastro/quicksort");

// Variante 1 – funktional, rekursiv
function quicksort1(arr) {
  if (arr.length === 0) return [];

  const pivot = arr[0];
  const left = arr.slice(1).filter((x) => x < pivot);
  const right = arr.slice(1).filter((x) => x >= pivot);

  return quicksort1(left).concat([pivot], quicksort1(right));
}

// Variante 2 – in-place
function quicksort2(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;

  const pivotIndex = partition(arr, left, right);
  quicksort2(arr, left, pivotIndex - 1);
  quicksort2(arr, pivotIndex + 1, right);
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}

// Variante 3 – Builtin
function builtinSort(arr) {
  return arr.slice().sort((a, b) => a - b);
}

// Benchmark Runner
function generateData(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 100000));
}

function runBenchmark(name, fn, input) {
  const start = performance.now();
  fn(input);
  const end = performance.now();
  return end - start;
}

function cloneArray(arr) {
  return arr.slice(); // flache Kopie
}

// Varianten-Map
const implementations = {
  quicksort1: (arr) => quicksort1(arr),
  quicksort2: (arr) => {
    const copy = cloneArray(arr);
    quicksort2(copy);
  },
  builtinSort: (arr) => builtinSort(arr),
  quicksort4: (arr) => quicksort4(arr),
};

// ---------------------
// Konfiguration
// ---------------------
const ITERATION_SIZES = [100, 1000, 10000, 100000, 1000000, 10000000];
const REPEATS = 3;

async function main() {
  console.log("== Benchmark QuickSort Varianten ==\n");

  for (const size of ITERATION_SIZES) {
    console.log(`Array-Größe: ${size}`);

    // einmaliges Datenset, für alle Varianten gleich (pro Run neu)
    const baseData = generateData(size);

    for (const [name, fn] of Object.entries(implementations)) {
      let totalTime = 0;

      for (let i = 0; i < REPEATS; i++) {
        const input = cloneArray(baseData);
        const time = runBenchmark(name, fn, input);
        totalTime += time;
      }

      const avgTime = (totalTime / REPEATS).toFixed(2);
      console.log(
        `  ${name.padEnd(12)}: Ø ${avgTime} ms über ${REPEATS} Läufe`,
      );
    }

    console.log(""); // Leerzeile zwischen Größen
  }
}

main();
