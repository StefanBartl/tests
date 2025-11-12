---@module 'diagnostics.demo'
---@version 1.0

-- #########################################################################
-- This Lua file intentionally triggers various diagnostics from lua-language-server.
-- Each block is labeled with what it is expected to trigger (Error/Warning/Hint),
-- assuming default lua_ls diagnostics. Use it to test your UI/rendering.
-- #########################################################################

-- =========================
-- Typing / Class definition
-- =========================

---@class Person
---@field name string
---@field age integer

---@type Person
local person

-- WARNING (type mismatch in table literal): 'age' should be integer, got string
person = {
  name = "Ann",
  age = "old", -- expect: type mismatch warning
}

           -- WARNING (undefined field on typed value): 'unknown' is not a field of Person
           person.unknown = 5


-- =========================
-- Deprecated symbol usage
-- =========================

---@deprecated
local function old_api()
  return "legacy"
end

-- INFO/HINT (use of deprecated function)
local legacy_value = old_api()


-- =========================
-- Undefined global / runtime error
-- =========================

-- ERROR (undefined global): 'does_not_exist' is not defined
print(does_not_exist + 1)


-- =========================
-- Redefinition / Unused locals
-- =========================

-- WARNING (redefined local): 'v' is redefined in the same scope
local v = 1
local v = 2

-- WARNING (unused local)
local unused_local = 42


-- =========================
-- Param/Return type mismatches
-- =========================

---@param s string
---@return integer
local function expects_string_returns_integer(s)
  -- ERROR/WARNING (return type mismatch): returning string instead of integer
  return "nope"
end

-- ERROR/WARNING (param type mismatch): passing number where string is expected
local r = expects_string_returns_integer(123)


-- =========================
-- Nil-check / potential nil access
-- =========================

---@type string|nil
local maybe_str

-- WARNING/HINT (need-check-nil): length operator on possibly-nil
print(#maybe_str)


-- =========================
-- Unused function (can show as HINT/WARNING depending on settings)
-- =========================

local function helper_unused()
  return 1
end


-- =========================
-- Shadowing globals (can be INFO/WARN)
-- =========================

-- WARNING/INFO (shadowing global 'print')
local print = print
print("shadowed print still works")


-- =========================
-- Missing module (resolution issue)
-- =========================

-- INFO/WARNING (cannot find module / module not found), depending on workspace config
local not_here = require("module_that_isnt_real")


-- =========================
-- Return type flow test
-- =========================

---@param x integer
---@return integer
local function plus_one(x)
  return x + 1
end

-- WARNING (type flow): assigning integer function result to annotated string
---@type string
local should_be_string = plus_one(10)


-- =========================
-- Global assignment (may warn if globals are restricted)
-- =========================

-- WARNING/INFO (assign to global): if your lua_ls is configured to flag global writes
_G.global_set_from_file = 123
