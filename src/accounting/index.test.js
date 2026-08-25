'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const {
  dataProgram,
  formatBalance,
  operations,
  parseAmount,
  resetBalance,
} = require('./index');

function displayCollector() {
  const messages = [];
  return {
    messages,
    display: (message) => messages.push(message),
  };
}

test.beforeEach(() => {
  resetBalance();
});

test('starts each session with a balance of 1000.00', () => {
  assert.equal(dataProgram('READ'), 100000);
  assert.equal(formatBalance(dataProgram('READ')), '1000.00');
});

test('READ returns the stored balance and WRITE updates it', () => {
  dataProgram('WRITE', 135075);

  assert.equal(dataProgram('READ'), 135075);
  assert.equal(formatBalance(dataProgram('READ')), '1350.75');
});

test('TOTAL displays the current balance', async () => {
  const output = displayCollector();

  await operations('TOTAL ', async () => '', output.display);

  assert.deepEqual(output.messages, ['Current balance: 1000.00']);
});

test('CREDIT adds the amount and persists the new balance', async () => {
  const output = displayCollector();

  await operations('CREDIT', async () => '250.00', output.display);

  assert.equal(dataProgram('READ'), 125000);
  assert.deepEqual(output.messages, ['Amount credited. New balance: 1250.00']);
});

test('multiple credits are cumulative', async () => {
  await operations('CREDIT', async () => '100.00', () => {});
  await operations('CREDIT', async () => '50.25', () => {});

  assert.equal(formatBalance(dataProgram('READ')), '1150.25');
});

test('DEBIT subtracts an amount below the current balance', async () => {
  const output = displayCollector();

  await operations('DEBIT ', async () => '275.50', output.display);

  assert.equal(formatBalance(dataProgram('READ')), '724.50');
  assert.deepEqual(output.messages, ['Amount debited. New balance: 724.50']);
});

test('DEBIT allows an amount exactly equal to the balance', async () => {
  await operations('DEBIT ', async () => '1000.00', () => {});

  assert.equal(dataProgram('READ'), 0);
});

test('DEBIT rejects an amount greater than the balance', async () => {
  const output = displayCollector();

  await operations('DEBIT ', async () => '1000.01', output.display);

  assert.equal(dataProgram('READ'), 100000);
  assert.deepEqual(output.messages, ['Insufficient funds for this debit.']);
});

test('a rejected debit does not prevent a later valid debit', async () => {
  await operations('DEBIT ', async () => '1000.01', () => {});
  await operations('DEBIT ', async () => '50.00', () => {});

  assert.equal(formatBalance(dataProgram('READ')), '950.00');
});

test('resetting the application restores the initial balance', () => {
  dataProgram('WRITE', 125000);
  resetBalance();

  assert.equal(formatBalance(dataProgram('READ')), '1000.00');
});

test('unsupported operations do not change the balance', async () => {
  const output = displayCollector();

  await operations('UNKNOWN', async () => '500.00', output.display);

  assert.equal(dataProgram('READ'), 100000);
  assert.deepEqual(output.messages, []);
});

test('amount parsing preserves cents and exposes invalid input', () => {
  assert.equal(parseAmount('25.50'), 2550);
  assert.equal(parseAmount('0.00'), 0);
  assert.equal(parseAmount('-10.25'), -1025);
  assert.equal(parseAmount('not-a-number'), null);
});

test('invalid transaction amounts do not change the balance', async () => {
  const output = displayCollector();

  await operations('CREDIT', async () => 'not-a-number', output.display);

  assert.equal(dataProgram('READ'), 100000);
  assert.deepEqual(output.messages, ['Invalid amount.']);
});

test('the application displays its menu and exits through option 4', () => {
  const output = execFileSync(process.execPath, ['index.js'], {
    cwd: __dirname,
    input: '4\n',
    encoding: 'utf8',
  });

  assert.match(output, /1\. View Balance/);
  assert.match(output, /2\. Credit Account/);
  assert.match(output, /3\. Debit Account/);
  assert.match(output, /4\. Exit/);
  assert.match(output, /Exiting the program\. Goodbye!/);
});

test('invalid menu input is rejected and the application continues', () => {
  const output = execFileSync(process.execPath, ['index.js'], {
    cwd: __dirname,
    input: '5\n4\n',
    encoding: 'utf8',
  });

  assert.match(output, /Invalid choice, please select 1-4\./);
  assert.equal((output.match(/Account Management System/g) || []).length, 2);
});