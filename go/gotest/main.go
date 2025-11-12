package main

import (
	"fmt"
)

func main() {

	ptr := new(int)
	fmt.Println("ptr naked", ptr)
	fmt.Println("ptr naked derefrenced", &ptr)
	*ptr = 42
	fmt.Println("ptr naked derefrenced", &ptr)
}
