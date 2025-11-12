// bench.ts
// Compare per-iteration config object access vs captured local vs literal true in Node.js (V8).
// Uses process.hrtime.bigint() and includes warm-up to trigger JIT optimization,
// while avoiding full constant folding via a dynamic alwaysTrue().

function hrtimeNs(): bigint {
  return process.hrtime.bigint();
}

// Blackhole to keep values observable across optimization passes
let SINK = 0;

// Dynamic truth to defeat trivial compile-time constant folding
function alwaysTrue(): boolean {
  // Date.now() > -1 is always true at runtime but not a compile-time constant.
  // V8 treats this as a runtime check, keeping the branch machinery intact.
  return Date.now() > -1;
}

function baselineEmptyLoop(n: number): void {
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += i;
  }
  SINK ^= s;
}

function caseTableAccess(n: number): void {
  const cfg = { val: true };
  let x = 0;
  for (let i = 0; i < n; i++) {
    if (cfg.val) {
      x += 42;
    }
  }
  SINK ^= x;
}

function caseCapturedLocal(n: number): void {
  const cfg = { val: true };
  const cond = cfg.val;
  let x = 0;
  for (let i = 0; i < n; i++) {
    if (cond) {
      x += 42;
    }
  }
  SINK ^= x;
}

function caseLiteralTrue(n: number): void {
  let x = 0;
  for (let i = 0; i < n; i++) {
    if (alwaysTrue()) {
      x += 42;
    }
  }
  SINK ^= x;
}

type Runner = { name: string; fn: (n: number) => void };

function run(n: number) {
  // warm-up JIT
  baselineEmptyLoop(1e6);
  caseTableAccess(1e6);
  caseCapturedLocal(1e6);
  caseLiteralTrue(1e6);

  const baselineStart = hrtimeNs();
  baselineEmptyLoop(n);
  const baselineNs = Number(hrtimeNs() - baselineStart);

  const cases: Runner[] = [
    { name: "A: table access", fn: caseTableAccess },
    { name: "B: captured local", fn: caseCapturedLocal },
    { name: "C: literal (dyn true)", fn: caseLiteralTrue },
  ];

  for (const c of cases) {
    const t0 = hrtimeNs();
    c.fn(n);
    const elapsed = Number(hrtimeNs() - t0) - baselineNs;
    const nsPer = elapsed / n;
    console.log(`${c.name.padEnd(20)} iters=${n}  time=${(elapsed / 1e9).toFixed(6)}s  ns/iter=${nsPer.toFixed(2)}`);
  }

  // Use SINK to prevent dead-code removal
  if (SINK === 42) console.log("impossible");
}

const iters = Number(process.argv[2] || 100_000_000);
run(iters);

