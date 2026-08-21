import { runAuthTests } from './unit/auth.test';
import { runTransactionTests } from './unit/transaction.test';
import { runReminderTests } from './unit/reminder.test';
import { runApiIntegrationTests } from './integration/api.test';

async function main() {
  console.log('====================================================');
  console.log('     MY UDHARI - BACKEND TEST SUITE RUNNER         ');
  console.log('====================================================');

  const authPassed = await runAuthTests();
  const txPassed = await runTransactionTests();
  const reminderPassed = await runReminderTests();
  const apiPassed = await runApiIntegrationTests();

  const allPassed = authPassed && txPassed && reminderPassed && apiPassed;

  console.log('\n====================================================');
  if (allPassed) {
    console.log('   🎉 ALL BACKEND TEST SUITES PASSED SUCCESSFULLY!  ');
  } else {
    console.error('   ❌ SOME BACKEND TESTS FAILED.                    ');
  }
  console.log('====================================================\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
