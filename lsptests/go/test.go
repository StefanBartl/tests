// test_errors.go
package main

// Absichtlich unnötige / falsche Importe
import (
	"fmt"
	// Wird nicht benutzt
	// Absichtlich falscher Import (existiert nicht)
)

// Funktion mit falscher Signatur (soll int zurückgeben, gibt string zurück)
func addNumbers(a int, b int) string {
	return fmt.Sprintf("%d", a+b)
}

func main() {
	fmt.Println("Hello, LSP Error Test in Go!")

	// Absichtlich undefinierte Variable
	fmt.Println(result)

	// Falscher Funktionsaufruf: erwartet int, gibt string
	sum := addNumbers("foo", 42)
	fmt.Println(sum)

	// Nicht verwendete Variable
	unused := 123

	// Typfehler: versuchen, int in string zu addieren
	invalid := 10 + "bar"
	fmt.Println(invalid)

	// Unerreichbarer Code
	return
	fmt.Println("This will never run")
}
