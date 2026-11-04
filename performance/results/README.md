# Benchmark results

Small, representative k6 summaries captured from the runs documented in
[`../../docs/performance-benchmark.md`](../../docs/performance-benchmark.md).

- [`baseline-cache-disabled.txt`](baseline-cache-disabled.txt) — uncached baseline, 15 req/s (median of 3 runs).
- [`redis-warm-cache.txt`](redis-warm-cache.txt) — Redis, warm cache, 15 req/s (median of 3 runs).
- [`redis-cold-cache.txt`](redis-cold-cache.txt) — Redis, cache flushed, single request.

The dashboard request latency is the `dashboard_metrics_duration` custom trend
(the `setup()` login request is excluded). Only these summaries are committed —
full raw k6 output is not.
