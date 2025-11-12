---@module 'bench.config_lookup'
--- Micro-benchmark for config-table access vs captured local vs no-branch.
--- Uses high-resolution timer in Neovim (vim.loop.hrtime); falls back to os.clock().

---@class BenchResult
---@field name string
---@field iters integer
---@field ns integer
---@field ns_per_iter number

---@class Config
---@field val boolean

local has_nvim = (type(vim) == "table") and vim.loop and type(vim.uv.hrtime) == "function"

---Get monotonic time in nanoseconds (integer).
---@return integer
local function now_ns()
  if has_nvim then
    return vim.uv.hrtime()
  else
    -- Fallback: os.clock() in seconds; convert to ns (coarse resolution!)
    return math.floor(os.clock() * 1e9 + 0.5)
  end
end

---@param iters integer
---@return integer
local function baseline_empty_loop(iters)
  -- Keep work observable across cases.
  local s = 0
  for i = 1, iters do
    s = s + i
  end
  return s
end

---@param iters integer
---@return integer
local function case_table_access(iters)
  local cfg = { val = true } ---@type Config
  local x = 0
  for _ = 1, iters do
    if cfg.val then
      x = x + 42
    end
  end
  return x
end

---@param iters integer
---@return integer
local function case_captured_local(iters)
  local cfg = { val = true } ---@type Config
  local cond = cfg.val
  local x = 0
  for _ = 1, iters do
    if cond then
      x = x + 42
    end
  end
  return x
end

---@param iters integer
---@return integer
local function case_no_branch(iters)
  -- Lower bound: no branch, just the work.
  local x = 0
  for _ = 1, iters do
    x = x + 42
  end
  return x
end

---@param name string
---@param fn fun(n: integer): integer
---@param iters integer
---@param baseline_ns integer
---@return BenchResult
local function bench(name, fn, iters, baseline_ns)
  local t0 = now_ns()
  local sink = fn(iters)
  local t1 = now_ns()
  if sink == -1 then print("blackhole") end
  local elapsed = t1 - t0 - baseline_ns
  if elapsed < 0 then elapsed = 0 end
  return {
    name = name,
    iters = iters,
    ns = elapsed,
    ns_per_iter = elapsed / iters,
  }
end

---@param iters integer
local function run(iters)
  -- Warm-up (especially useful for LuaJIT)
  baseline_empty_loop(500000)
  case_table_access(500000)
  case_captured_local(500000)
  case_no_branch(500000)

  -- Baseline of empty loop
  local b0 = now_ns()
  local _ = baseline_empty_loop(iters)
  local b1 = now_ns()
  local base = b1 - b0

  local results = {
    bench("A: table access",   case_table_access,   iters, base),
    bench("B: captured local", case_captured_local, iters, base),
    bench("C: no branch",      case_no_branch,      iters, base),
  }

  for _, r in ipairs(results) do
    print(string.format("%-18s iters=%d  time=%.6fs  ns/iter=%.2f",
      r.name, r.iters, r.ns / 1e9, r.ns_per_iter))
  end
end

-- Parse iterations; accept underscores like "50_000_000"
local raw = (type(arg) == "table" and arg[1]) or "5000000"
local cleaned = tostring(raw):gsub("_", "")
local iters = tonumber(cleaned) or 50000000
run(iters)
