# COBOL Account Management Test Plan

This test plan describes the current business logic and implementation of the
COBOL account-management application. The `Actual Result`, `Status`, and
`Comments` fields should be completed during stakeholder validation and later
used to guide unit and integration tests in the Node.js implementation.

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Start the application with a new account session | The application is not running; compile the three COBOL programs successfully | 1. Start the application.<br>2. Select `1` to view the balance. | The account balance is `1000.00`, which is the initial in-memory balance. | TBD | TBD | Confirm the agreed starting balance with stakeholders. |
| TC-002 | Display the account-management menu | The application is running | 1. Observe the initial screen.<br>2. Complete one operation and return to the menu. | The menu displays options for View Balance, Credit Account, Debit Account, and Exit, and is shown again after an operation. | TBD | TBD |  |
| TC-003 | View the current balance | The application is running; the stored balance is `1000.00` | 1. Select `1`. | `Operations` requests a `READ` from `DataProgram` and displays `Current balance: 1000.00`. | TBD | TBD |  |
| TC-004 | Credit the account with a positive amount | The stored balance is `1000.00` | 1. Select `2`.<br>2. Enter `250.00`.<br>3. Select `1`. | The credit is accepted, the new balance displayed after credit is `1250.00`, and a later balance view also returns `1250.00`. | TBD | TBD |  |
| TC-005 | Apply multiple credits cumulatively | The stored balance is `1000.00` | 1. Select `2` and enter `100.00`.<br>2. Select `2` and enter `50.25`.<br>3. Select `1`. | The final balance is `1150.25`; each successful credit reads the current value and writes the updated value. | TBD | TBD |  |
| TC-006 | Debit an amount less than the current balance | The stored balance is `1000.00` | 1. Select `3`.<br>2. Enter `275.50`.<br>3. Select `1`. | The debit is accepted, the new balance is `724.50`, and the updated value is stored. | TBD | TBD |  |
| TC-007 | Debit an amount exactly equal to the current balance | The stored balance is `1000.00` | 1. Select `3`.<br>2. Enter `1000.00`.<br>3. Select `1`. | The debit is accepted because the balance is greater than or equal to the amount; the resulting balance is `0.00`. | TBD | TBD | Confirm whether a zero balance is permitted. |
| TC-008 | Reject a debit greater than the current balance | The stored balance is `1000.00` | 1. Select `3`.<br>2. Enter `1000.01`.<br>3. Select `1`. | The application displays `Insufficient funds for this debit.` and the stored balance remains `1000.00`. | TBD | TBD |  |
| TC-009 | Confirm a rejected debit does not change the balance | The stored balance is `100.00` | 1. Attempt to debit `100.01`.<br>2. Attempt to debit `50.00`.<br>3. Select `1`. | The first debit is rejected; the second debit succeeds and the final balance is `50.00`, proving the rejected debit did not write a new value. | TBD | TBD |  |
| TC-010 | Handle an invalid menu choice | The application is running | 1. Enter a value outside `1` through `4`, such as `5`.<br>2. Enter a valid choice. | The application displays `Invalid choice, please select 1-4.` and returns to the menu without changing the balance. | TBD | TBD | Repeat with a non-numeric value if supported by the test environment. |
| TC-011 | Exit the application | The application is running | 1. Select `4`. | The loop ends and the application displays `Exiting the program. Goodbye!`. | TBD | TBD |  |
| TC-012 | Confirm balance resets when the application restarts | Complete a credit or debit so the balance is not `1000.00`; exit the application | 1. Start the application again.<br>2. Select `1`. | The balance is `1000.00` because `DataProgram` stores the balance only in working memory and does not persist it between runs. | TBD | TBD | Confirm whether Node.js should preserve or replace this behavior. |
| TC-013 | Verify the data layer `READ` operation | `DataProgram` is available; its storage balance is initialized | 1. Call `DataProgram` with operation `READ` and a balance field.<br>2. Inspect the returned balance. | The caller's balance field is replaced with the stored balance. | TBD | TBD | Unit-test candidate for `DataProgram`. |
| TC-014 | Verify the data layer `WRITE` operation | `DataProgram` is available | 1. Set a caller balance to `1350.75`.<br>2. Call `DataProgram` with operation `WRITE`.<br>3. Call it again with `READ`. | `WRITE` replaces the stored balance, and the subsequent `READ` returns `1350.75`. | TBD | TBD | Unit-test candidate for the storage adapter. |
| TC-015 | Verify unsupported internal operation handling | `Operations` or `DataProgram` can be invoked directly | 1. Call the program with an unsupported operation code.<br>2. View the balance afterward. | No credit, debit, read, or write action occurs. The current implementation emits no explicit error for an unsupported operation. | TBD | TBD | Decide whether the Node.js application should reject unsupported commands explicitly. |
| TC-016 | Observe zero and negative transaction amounts | The stored balance is `1000.00`; the runtime accepts the supplied numeric input | 1. Attempt a credit of `0.00`.<br>2. Attempt a debit of `0.00`.<br>3. If the runtime accepts it, attempt a negative amount.<br>4. View the balance after each operation. | The current COBOL code has no explicit positive-amount validation. Record the compiler/runtime behavior and obtain a business decision for the Node.js validation rule. | TBD | TBD | This is a known implementation gap, not an assumed approved business rule. |

## Execution Notes

- Run each case in an isolated session unless the pre-conditions specify a
  balance established by an earlier step.
- Amounts use two decimal places and are represented by COBOL numeric fields
  with two implied decimal digits.
- Preserve the exact user-facing messages when comparing current behavior to
  the migrated application, unless stakeholders approve revised wording.