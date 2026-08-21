import { reminderService } from '../../src/services/reminder.service';
import { reminderRepository } from '../../src/repositories/reminder.repository';
import { customerService } from '../../src/services/customer.service';
import { transactionService } from '../../src/services/transaction.service';
import { db } from '../../src/config/database';

export async function runReminderTests(): Promise<boolean> {
  console.log('\n--- Running 8-Day Reminder Engine & Auto-Cancellation Tests ---');
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

    // 1. Test Scan & Schedule 8-Day Reminders
    const scanResult = await reminderService.scanAndScheduleReminders();
    assert(typeof scanResult.count === 'number', 'scanAndScheduleReminders returns count of eligible reminders');

    // 2. Test Batch Process Scheduled Reminders
    const batchResult = await reminderService.processBatchReminders();
    assert(Array.isArray(batchResult.jobs), 'processBatchReminders processes scheduled reminder jobs');

    // 3. Test PRD 11.5 Auto-cancellation on payment clearance
    // Create customer with due balance and a scheduled reminder
    const phone = `97${Math.floor(10000000 + Math.random() * 90000000)}`;
    const { customer } = await customerService.createCustomer({
      name: 'Auto-Cancel Test Customer',
      phone,
      initialBalance: 750,
      reminderEnabled: true,
    });

    // Create a scheduled reminder job for this customer
    const remJob = await reminderRepository.create({
      id: `rem-test-${Date.now()}`,
      storeId: 'store-01',
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      amount: 750,
      shopName: 'Test Store',
      scheduledDate: new Date().toISOString(),
      status: 'SCHEDULED',
      channel: 'WHATSAPP',
      retries: 0,
      messageText: 'Reminder text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Check reminder is in SCHEDULED status
    const beforePayment = await reminderRepository.findById(remJob.id);
    assert(beforePayment?.status === 'SCHEDULED', 'Reminder is SCHEDULED before payment');

    // Now record full payment of 750 -> balance becomes 0
    await transactionService.recordTransaction({
      customerId: customer.id,
      type: 'PAYMENT',
      amount: 750,
      note: 'Full settlement',
    });

    // Verify reminder was automatically removed/cancelled by PRD 11.5 rule
    const afterPayment = await reminderRepository.findById(remJob.id);
    assert(afterPayment === null, 'PRD 11.5: Pending scheduled reminder is automatically removed upon full payment clearance');

    // Cleanup
    await customerService.deleteCustomer(customer.id);

  } catch (err) {
    console.error('  ✗ Unexpected error in Reminder Tests:', err);
    failed++;
  }

  console.log(`Reminder Tests Summary: ${passed} passed, ${failed} failed`);
  return failed === 0;
}
