interface Option {
    text: string;
    nextQuestionIndex?: number;
}

interface Question {
    id: number;
    type: string;
    options?: Option[];
    skipLogic?: { answer: string; nextQuestionId: number }[];
}

export const calculateNextQuestionIndex = (
    currentQuestion: Question,
    currentQuestionIndex: number,
    answer: any,
    allQuestions: Question[]
): number => {
    let nextIndex = currentQuestionIndex + 1;

    // Check for skip logic in options (Single Choice)
    if (currentQuestion.options && (currentQuestion.type === 'SINGLE_CHOICE')) {
        if (typeof answer === 'string') {
            const selectedOption = currentQuestion.options.find(opt => opt.text === answer);
            if (selectedOption?.nextQuestionIndex !== undefined && selectedOption.nextQuestionIndex !== null) {
                if (selectedOption.nextQuestionIndex === -1) {
                    return -1; // End survey
                }
                return selectedOption.nextQuestionIndex;
            }
        }
    }

    // Fallback to old logic if exists
    if (currentQuestion.skipLogic) {
        const logic = currentQuestion.skipLogic.find(l => l.answer === answer);
        if (logic) {
            const targetIndex = allQuestions.findIndex(q => q.id === logic.nextQuestionId);
            if (targetIndex !== -1) nextIndex = targetIndex;
        }
    }

    return nextIndex;
};
