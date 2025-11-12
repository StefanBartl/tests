// ============================================================================
// Program.cs
// Minimal C# workspace to exercise LSP features (hover, go-to-def, rename, etc.)
// All comments are in English by request.
// Target: .NET 8 console app.
// ============================================================================

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading;
using System.Threading.Tasks;

namespace LspProbe
{
    /// <summary>
    /// Demonstrates XML docs (hover), rename symbol, go-to-definition, and code actions.
    /// </summary>
    public static class Program
    {
        // Entry point. Place cursor on Main to test "Go to Definition" or "Find References".
        public static async Task Main(string[] args)
        {



        // --- ERROR ---
        // 'x' wird nie deklariert -> Compiler/LSP-Error
        Console.WriteLine(x);

        // --- WARNING ---
        // Variable 'unusedVar' wird zugewiesen, aber nie verwendet
        int unusedVar = 42;

        // --- INFO ---
        // Der LSP (z. B. OmniSharp) gibt oft "Info" aus,
        // wenn ein 'using' nicht gebraucht wird
        using System.Text;

        // --- HINT ---
        // String-Interpolation hier könnte als Hint vorgeschlagen werden
        var name = "World";
        Console.WriteLine("Hello " + name); // LSP könnte Hint: $"Hello {name}"




          // Completion test: type "Calcu" and use completion to get Calculator.
            var sum = Calculator.Add(1, 2);

            // Hover/Signature Help test: hover over Add to view signature and XML doc.
            Console.WriteLine($"Sum = {sum}");

            // Diagnostic test: unused variable should trigger a warning from the analyzer/LSP.
            int unusedLocal = 42;

            // Code Action test: this obsolete call should propose fixes/suppressions.
            Legacy.Warn();

             // Go to definition into a record type.
            var p = new Person("Ada", 37);
            Console.WriteLine(p);

            // Generic + interface usage (navigate into types).
            IBox<string> box = new Box<string>("hello");
            Console.WriteLine(box.Value);

            // Async + CancellationToken to test inlay hints/signature help.
            using var cts = new CancellationTokenSource();
            var data = await FetchDataAsync("resource-123", cts.Token);
            Console.WriteLine(string.Join(",", data));

            // Formatting test: misaligned spacing—use LSP format to fix.
            int a=1;   int b =2;   int c= a+b;
            Console.WriteLine($"c = {c}");

            // TODO code action: hover/code action on TODO comments often supported.
            // TODO: replace Console.WriteLine with structured logging.
        }

        /// <summary>
        /// Async sample to test signature help + cancellation propagation.
        /// </summary>
        /// <param name="id">Resource identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Simulated payload</returns>
        public static async Task<List<string>> FetchDataAsync(
            string id,
            CancellationToken cancellationToken)
        {
            // Simulate I/O
            await Task.Delay(50, cancellationToken).ConfigureAwait(false);
            return new List<string> { "alpha", "beta", id };
        }
    }

    /// <summary>
    /// Simple calculator to test navigation and rename refactorings.
    /// </summary>
    public static class Calculator
    {
        /// <summary>Adds two integers.</summary>
        public static int Add(int x, int y) => x + y;

        /// <summary>Multiply with a deliberate style to test formatter.</summary>
        public static int Multiply( int x,  int y ) { return x*y; }
    }

    /// <summary>
    /// Interface to test go-to-implementation and quick fixes on interface members.
    /// </summary>
    /// <typeparam name="T">Contained value type</typeparam>
    public interface IBox<T>
    {
        /// <summary>Gets the wrapped value.</summary>
        T Value { get; }
    }

    /// <summary>
    /// Generic class implementing IBox to test generics navigation.
    /// </summary>
    /// <typeparam name="T">Contained value type</typeparam>
    public sealed class Box<T> : IBox<T>
    {
        /// <inheritdoc />
        public T Value { get; }

        /// <summary>Constructor used by completion/parameter hints.</summary>
        public Box(T value)
        {
            // Nullability hint test: annotate and see quick fixes.
            Value = value;
        }
    }

    /// <summary>
    /// Record type to test navigation and with-expressions in newer C#.
    /// </summary>
    /// <param name="Name">Person's name</param>
    /// <param name="Age">Person's age</param>
    public readonly record struct Person(string Name, int Age);

    /// <summary>
    /// Obsolete API to trigger diagnostics and code actions.
    /// </summary>
    public static class Legacy
    {
        [Obsolete("Use structured logging instead of Legacy.Warn()", error: false)]
        public static void Warn()
        {
            Console.WriteLine("Legacy warning");
        }
    }

    /// <summary>
    /// Attribute usage demo to exercise analyzers/code actions for nullability.
    /// </summary>
    public static class Guard
    {
        /// <summary>Throws if argument is null. Use to test inline diagnostics.</summary>
        public static void NotNull([NotNull] object? value, string paramName)
        {
            if (value is null)
                throw new ArgumentNullException(paramName);
        }
    }
}

