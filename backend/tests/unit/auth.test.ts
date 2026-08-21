import { authService } from '../../src/services/auth.service';
import { db } from '../../src/config/database';
import { signJwt, verifyJwt, hashPin, verifyPin } from '../../src/utils/crypto';

export async function runAuthTests(): Promise<boolean> {
  console.log('\n--- Running Auth Tests ---');
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

    // Test 1: PIN Hashing & Verification
    const pin = '1234';
    const hashed = hashPin(pin);
    assert(verifyPin('1234', hashed), 'verifyPin returns true for correct PIN');
    assert(!verifyPin('9999', hashed), 'verifyPin returns false for incorrect PIN');

    // Test 2: JWT Signing & Verification
    const payload = {
      id: 'test-user-1',
      name: 'Tester',
      phone: '+91 99999 88888',
      role: 'Owner' as const,
      storeId: 'store-01',
    };
    const token = signJwt(payload, 3600);
    const decoded = verifyJwt(token);
    assert(decoded !== null, 'verifyJwt successfully decodes valid token');
    assert(decoded?.name === 'Tester' && decoded?.role === 'Owner', 'JWT claims match payload');
    assert(verifyJwt('invalid.token.here') === null, 'verifyJwt returns null for invalid token');

    // Test 3: Store Login with Valid PIN
    const loginResult = await authService.storeLogin('Owner', '1234');
    assert(loginResult.token.length > 0, 'storeLogin returns non-empty JWT token');
    assert(loginResult.user.role === 'Owner', 'storeLogin user has Owner role');

    // Test 4: Customer OTP Flow
    const otpResult = await authService.customerSendOtp('9876543210');
    assert(otpResult.demoOtp.length === 4, 'customerSendOtp generates 4-digit OTP');

    const verifyResult = await authService.customerVerifyOtp('9876543210', otpResult.demoOtp);
    assert(verifyResult.session.isLoggedIn === true, 'customerVerifyOtp logs in customer');
    assert(verifyResult.session.role === 'Customer', 'Customer session has Customer role');

  } catch (err) {
    console.error('  ✗ Unexpected error in Auth Tests:', err);
    failed++;
  }

  console.log(`Auth Tests Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
