// test.zig
const std = @import("std");

/// Adds two numbers and returns the sum
fn addNumbers(a: i32, b: i32) i32 {
    return a + b;
}

pub fn main() void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello, LSP Test in Zig!\n", .{});

    const result = addNumbers(5, 7);
    try stdout.print("5 + 7 = {}\n", .{result});
}
