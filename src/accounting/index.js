'use strict';

const readline = require('node:readline');

const INITIAL_BALANCE_CENTS = 100000;
let storageBalanceCents = INITIAL_BALANCE_CENTS;

function dataProgram(operation, balanceCents) {
  if (operation === 'READ') {
    return storageBalanceCents;
  }

  if (operation === 'WRITE') {
    storageBalanceCents = balanceCents;
  }

  return storageBalanceCents;
}

function formatBalance(balanceCents) {
  return (balanceCents / 100).toFixed(2);
}

function parseAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

function resetBalance() {
  storageBalanceCents = INITIAL_BALANCE_CENTS;
}

async function operations(operationType, ask, display = console.log) {
  if (operationType === 'TOTAL ') {
    const balanceCents = dataProgram('READ');
    display(`Current balance: ${formatBalance(balanceCents)}`);
    return;
  }

  if (operationType !== 'CREDIT' && operationType !== 'DEBIT ') {
    return;
  }

  const prompt = operationType === 'CREDIT'
    ? 'Enter credit amount: '
    : 'Enter debit amount: ';
  const input = await ask(prompt);
  const amountCents = parseAmount(input);

  if (amountCents === null) {
    display('Invalid amount.');
    return;
  }

  let balanceCents = dataProgram('READ');

  if (operationType === 'CREDIT') {
    balanceCents += amountCents;
    dataProgram('WRITE', balanceCents);
    display(`Amount credited. New balance: ${formatBalance(balanceCents)}`);
    return;
  }

  if (balanceCents >= amountCents) {
    balanceCents -= amountCents;
    dataProgram('WRITE', balanceCents);
    display(`Amount debited. New balance: ${formatBalance(balanceCents)}`);
  } else {
    display('Insufficient funds for this debit.');
  }
}

function createQuestioner(input, output) {
  const terminal = readline.createInterface({ input, output });

  return {
    ask(question) {
      return new Promise((resolve) => terminal.question(question, resolve));
    },
    close() {
      terminal.close();
    },
  };
}

async function run() {
  const questioner = createQuestioner(process.stdin, process.stdout);
  let continueRunning = true;

  try {
    while (continueRunning) {
      console.log('--------------------------------');
      console.log('Account Management System');
      console.log('1. View Balance');
      console.log('2. Credit Account');
      console.log('3. Debit Account');
      console.log('4. Exit');
      console.log('--------------------------------');

      const choice = await questioner.ask('Enter your choice (1-4): ');

      switch (choice.trim()) {
        case '1':
          await operations('TOTAL ', questioner.ask, console.log);
          break;
        case '2':
          await operations('CREDIT', questioner.ask, console.log);
          break;
        case '3':
          await operations('DEBIT ', questioner.ask, console.log);
          break;
        case '4':
          continueRunning = false;
          break;
        default:
          console.log('Invalid choice, please select 1-4.');
      }
    }
  } finally {
    questioner.close();
  }

  console.log('Exiting the program. Goodbye!');
}

if (require.main === module) {
  run();
}

module.exports = {
  dataProgram,
  formatBalance,
  operations,
  parseAmount,
  resetBalance,
  run,
};