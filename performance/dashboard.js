// k6 benchmark for the SyncDesk dashboard metrics endpoint.
//
// Endpoint under test: GET /api/dashboard/metrics — an aggregate snapshot
// (count by status, count by priority, unassigned) served cache-aside from
// Redis.
//
// Profiles (pick with PROFILE):
//   default ("rate")  constant-arrival-rate at RATE req/s (default 15).
//                     The same offered load is applied to the baseline and the
//                     cached backend, so latency is directly comparable.
//   "vus"             constant VUs (VUS, default 20) — a saturating profile used
//                     to observe maximum achievable throughput.
// Scenarios (pick with SCENARIO):
//   default           warm-up (15s) + sustained (45s).
//   "cold"            a single request against an emptied cache (1 VU, 1 iter).
//
// The latency of the dashboard request is recorded in the custom trend
// `dashboard_metrics_duration` (in ms) so the login request made in setup() does
// not pollute the endpoint latency.
//
// Run the baseline by starting the backend with caching disabled
// (CACHE_ENABLED=false) and using the same profile. See performance/README.md.
//
// Usage:
//   k6 run performance/dashboard.js                        # 15 req/s, warm+cold mix
//   PROFILE=vus k6 run performance/dashboard.js            # max throughput
//   SCENARIO=cold k6 run performance/dashboard.js          # single cold request
//   BASE_URL=http://<host>:8080 k6 run performance/dashboard.js

import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.EMAIL || 'admin@syncdesk.com';
const PASSWORD = __ENV.PASSWORD || 'Admin@123';
const ENDPOINT = __ENV.ENDPOINT || '/api/dashboard/metrics';
const RATE = Number(__ENV.RATE || 15);
const VUS = Number(__ENV.VUS || 20);

const isColdRun = __ENV.SCENARIO === 'cold';
const useVusProfile = __ENV.PROFILE === 'vus';

const metricsDuration = new Trend('dashboard_metrics_duration', true);

const rateScenarios = {
  warmup: {
    executor: 'constant-arrival-rate',
    rate: RATE,
    timeUnit: '1s',
    duration: '15s',
    preAllocatedVUs: 10,
    maxVUs: 50,
    gracefulStop: '0s',
    tags: { phase: 'warmup' },
  },
  sustained: {
    executor: 'constant-arrival-rate',
    rate: RATE,
    timeUnit: '1s',
    duration: '45s',
    startTime: '15s',
    preAllocatedVUs: 10,
    maxVUs: 50,
    tags: { phase: 'sustained' },
  },
};

const vusScenarios = {
  warmup: {
    executor: 'constant-vus',
    vus: Math.max(1, Math.round(VUS / 2)),
    duration: '15s',
    gracefulStop: '0s',
    tags: { phase: 'warmup' },
  },
  sustained: {
    executor: 'constant-vus',
    vus: VUS,
    duration: '45s',
    startTime: '15s',
    tags: { phase: 'sustained' },
  },
};

// Single request against an emptied cache. Flush Redis before running this.
const coldScenarios = {
  cold: {
    executor: 'per-vu-iterations',
    vus: 1,
    iterations: 1,
    tags: { phase: 'cold' },
  },
};

export const options = {
  scenarios: isColdRun ? coldScenarios : (useVusProfile ? vusScenarios : rateScenarios),
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'login' } }
  );
  check(res, { 'login succeeded': (r) => r.status === 200 });
  return { token: res.json('token') };
}

export default function (data) {
  const res = http.get(`${BASE_URL}${ENDPOINT}`, {
    headers: { Authorization: `Bearer ${data.token}` },
    tags: { name: ENDPOINT },
  });
  metricsDuration.add(res.timings.duration);
  check(res, { 'status is 200': (r) => r.status === 200 });
}
