
// bench_config_lookup_test.go
// go test -bench=. -benchmem
package bench

import "testing"

type Config struct {
	val bool
}

var sink int

//go:noinline
func alwaysTrue() bool {
	// Dynamic enough to avoid compile-time constant propagation
	return (int64(testing.AllocsPerRun(1, func() {})) >= 0)
}

func BenchmarkTableAccess(b *testing.B) {
	cfg := Config{val: true}
	x := 0
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		if cfg.val {
			x += 42
		}
	}
	sink ^= x
}

func BenchmarkCapturedLocal(b *testing.B) {
	cfg := Config{val: true}
	cond := cfg.val
	x := 0
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		if cond {
			x += 42
		}
	}
	sink ^= x
}

func BenchmarkLiteralDynTrue(b *testing.B) {
	x := 0
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		if alwaysTrue() {
			x += 42
		}
	}
	sink ^= x
}
