import { generateChallenge, solveChallenge } from "./utils/jsChallenge";

// Simple test runner for the challenge system
console.log("Testing JavaScript Challenge System...\n");

let passCount = 0;
let failCount = 0;

for (let i = 0; i < 20; i++) {
  try {
    const challenge = generateChallenge();
    const solution = solveChallenge(challenge.challenge);

    console.log(`Test ${i + 1}:`);
    console.log(`  Challenge: ${challenge.challenge}`);
    console.log(`  Expected: ${challenge.solution}`);
    console.log(`  Computed: ${solution}`);

    if (solution === challenge.solution) {
      console.log(`  Result: ✅ PASSED\n`);
      passCount++;
    } else {
      console.log(`  Result: ❌ FAILED\n`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`  Result: ❌ ERROR - ${error.message}\n`);
    failCount++;
  }
}

console.log(`Final Results: ✅ ${passCount} passed, ❌ ${failCount} failed`);
