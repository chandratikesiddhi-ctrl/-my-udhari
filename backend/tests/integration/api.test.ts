import { app } from '../../src/app';
import { db } from '../../src/config/database';
import { signJwt } from '../../src/utils/crypto';

// Minimal in-memory HTTP caller for Express app
async function callApi(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    // Custom mock response object
    let statusCode = 200;
    let responseData: any = null;
    const headers: Record<string, string> = {};

    const req: any = {
      method,
      url,
      originalUrl: url,
      path: url.split('?')[0],
      query: {},
      params: {},
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body || {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };

    // Parse query params if any
    if (url.includes('?')) {
      const qStr = url.split('?')[1];
      const params = new URLSearchParams(qStr);
      params.forEach((v, k) => {
        req.query[k] = v;
      });
    }

    const res: any = {
      statusCode: 200,
      header(key: string, val: string) {
        headers[key] = val;
        return this;
      },
      setHeader(key: string, val: string) {
        headers[key] = val;
        return this;
      },
      status(code: number) {
        statusCode = code;
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        resolve({ status: statusCode, body: responseData });
      },
      send(data: any) {
        responseData = data;
        resolve({ status: statusCode, body: responseData });
      },
      sendStatus(code: number) {
        statusCode = code;
        resolve({ status: statusCode, body: null });
      },
      on(_event: string, _cb: any) {},
    };

    app(req, res, () => {
      resolve({ status: 404, body: { success: false, code: 'NOT_FOUND' } });
    });
  });
}

export async function runApiIntegrationTests(): Promise<boolean> {
  console.log('\n--- Running API Integration Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    await db.init();

    // 1. Health Check
    const health = await callApi('GET', '/api/v1/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/v1/health returns status: healthy');

    // 2. Store Login with valid PIN
    const loginRes = await callApi('POST', '/api/v1/auth/store/login', {
      role: 'Owner',
      pin: '1234',
    });
    assert(loginRes.status === 200 && loginRes.body.success === true, 'POST /api/v1/auth/store/login returns 200 with JWT');
    const token = loginRes.body.data?.token;

    // 3. Store Login with invalid PIN -> 400
    const badLoginRes = await callApi('POST', '/api/v1/auth/store/login', {
      role: 'Owner',
      pin: '0000',
    });
    assert(badLoginRes.status === 400 && badLoginRes.body.success === false, 'POST /api/v1/auth/store/login with wrong PIN returns 400');

    // 4. Protected Route without token -> 401
    const unauthRes = await callApi('GET', '/api/v1/customers');
    assert(unauthRes.status === 401, 'GET /api/v1/customers without Bearer token returns 401 Unauthorized');

    // 5. Protected Route with valid token -> 200
    const customersRes = await callApi('GET', '/api/v1/customers', undefined, token);
    assert(customersRes.status === 200 && Array.isArray(customersRes.body.data?.customers), 'GET /api/v1/customers with Bearer token returns customers list');

    // 6. Reports Summary Endpoint
    const reportsRes = await callApi('GET', '/api/v1/reports/summary', undefined, token);
    assert(reportsRes.status === 200 && typeof reportsRes.body.data?.totalOutstanding === 'number', 'GET /api/v1/reports/summary returns aggregate report metrics');

    // 7. Backup Export Endpoint
    const backupRes = await callApi('GET', '/api/v1/backup/export', undefined, token);
    assert(backupRes.status === 200 && backupRes.body.data?.version === '1.0.0', 'GET /api/v1/backup/export returns valid full database backup');

  } catch (err) {
    console.error('  ✗ Unexpected error in API Integration Tests:', err);
    failed++;
  }

  console.log(`API Integration Tests Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
