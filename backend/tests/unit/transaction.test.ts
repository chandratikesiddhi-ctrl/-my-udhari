import { transactionService } from '../../src/services/transaction.service';
import { customerService } from '../../src/services/customer.service';
import { db } from '../../src/config/database';

export async function runTransactionTests(): Promise<boolean> {
  console.log('\n--- Running Transaction Engine & Balance Arithmetic Tests ---');
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

    // Create fresh test customer
    const phone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const { customer } = await customerService.createCustomer({
      name: 'Tx Test Customer',
      phone,
      initialBalance: 1000,
    });

    assert(customer.balance === 1000, 'Initial customer balance is 1000');

    // Test Credit Transaction (BR-001: balance increases)
    const creditRes = await transactionService.recordTransaction({
      customerId: customer.id,
      type: 'CREDIT',
      amount: 500,
      note: 'Added provisions',
    });
    assert(creditRes.customer.balance === 1500, 'Recording CREDIT increases balance to 1500');
    assert(creditRes.transaction.balanceAfter === 1500, 'Transaction balanceAfter is 1500');

    // Test Payment Transaction (BR-001: balance decreases)
    const paymentRes = await transactionService.recordTransaction({
      customerId: customer.id,
      type: 'PAYMENT',
      amount: 600,
      note: 'Cash payment',
    });
    assert(paymentRes.customer.balance === 900, 'Recording PAYMENT decreases balance to 900');
    assert(paymentRes.transaction.balanceAfter === 900, 'Transaction balanceAfter is 900');

    // Test Full Settlement Payment (balance becomes 0)
    const settleRes = await transactionService.recordTransaction({
      customerId: customer.id,
      type: 'PAYMENT',
      amount: 900,
      note: 'Full settlement',
    });
    assert(settleRes.customer.balance === 0, 'Full payment brings balance to 0 (settled)');

    // Test Advance Payment (balance becomes negative / store owes customer)
    const advanceRes = await transactionService.recordTransaction({
      customerId: customer.id,
      type: 'PAYMENT',
      amount: 200,
      note: 'Advance deposit',
    });
    assert(advanceRes.customer.balance === -200, 'Advance payment results in negative balance (-200)');

    // Cleanup test customer
    await customerService.deleteCustomer(customer.id);

  } catch (err) {
    console.error('  ✗ Unexpected error in Transaction Tests:', err);
    failed++;
  }

  console.log(`Transaction Tests Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
