// Logic to test
interface Question {
    id: number;
    skipLogic?: { answer: string; nextQuestionId: number }[];
}

const calculateNextQuestionIndex = (
    currentQuestion: Question,
    currentQuestionIndex: number,
    answer: any,
    allQuestions: Question[]
): number => {
    let nextIndex = currentQuestionIndex + 1;

    if (currentQuestion.skipLogic) {
        const logic = currentQuestion.skipLogic.find(l => l.answer === answer);
        if (logic) {
            const targetIndex = allQuestions.findIndex(q => q.id === logic.nextQuestionId);
            if (targetIndex !== -1) nextIndex = targetIndex;
        }
    }

    return nextIndex;
};

// Test Data
const MOCK_QUESTIONS = [
    { id: 1, text: 'Q1' },
    {
        id: 2,
        text: 'Q2',
        skipLogic: [{ answer: 'Skip', nextQuestionId: 4 }]
    },
    { id: 3, text: 'Q3' },
    { id: 4, text: 'Q4' },
];

// Runner
const runTests = () => {
    console.log('Running Survey Logic Tests...');

    // Test 1: Normal flow
    const next1 = calculateNextQuestionIndex(MOCK_QUESTIONS[0], 0, 'Any', MOCK_QUESTIONS);
    if (next1 === 1) console.log('✅ Test 1 Passed: Normal flow');
    else console.error('❌ Test 1 Failed');

    // Test 2: Skip Logic Triggered
    const next2 = calculateNextQuestionIndex(MOCK_QUESTIONS[1], 1, 'Skip', MOCK_QUESTIONS);
    if (next2 === 3) console.log('✅ Test 2 Passed: Skip logic triggered (Index 1 -> 3)'); // Index 3 is Q4 (id 4)
    else console.error(`❌ Test 2 Failed: Expected 3, got ${next2}`);

    // Test 3: Skip Logic Not Triggered
    const next3 = calculateNextQuestionIndex(MOCK_QUESTIONS[1], 1, 'Other', MOCK_QUESTIONS);
    if (next3 === 2) console.log('✅ Test 3 Passed: Skip logic not triggered');
    else console.error('❌ Test 3 Failed');
};

runTests();
