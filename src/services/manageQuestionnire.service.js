const primeQuestionsModel = require('../models/questions-prime.model');
const QuestionsByAgeGroupModel = require('../models/questions-byAgeGroup.model');

exports.processVendorFile = async (questionsMap) => {
  const newOptionValues = new Set();

  if (questionsMap['__statements']) {
    const greetingDoc = await primeQuestionsModel.findOne({ type: 'question' });

    if (greetingDoc) {
      if (JSON.stringify(greetingDoc.system_greetings) !== JSON.stringify(questionsMap['__statements'])) {
        greetingDoc.system_greetings = questionsMap['__statements'];
        await greetingDoc.save();
      }
    } else {
      await primeQuestionsModel.create({
        type: 'statement',
        questionText: 'System Greetings',
        system_greetings: questionsMap['__statements']
      });
    }
  }

  for (const key of Object.keys(questionsMap)) {
    if (key === '__statements') continue;

    const { questionText, options } = questionsMap[key];

    const existingQuestion = await primeQuestionsModel.findOne({ questionText, type: 'question' });

    if (existingQuestion) {
      const newOptionsJSON = JSON.stringify(options);
      const existingOptionsJSON = JSON.stringify(existingQuestion.options);
      if (newOptionsJSON !== existingOptionsJSON) {
        existingQuestion.options = options;
        await existingQuestion.save();
      }
    } else {
      await primeQuestionsModel.create({
        questionText,
        type: 'question',
        options
      });
    }

    for (const opt of options) {
      if (opt.value) newOptionValues.add(opt.value);
    }
  }

  const existingValues = await QuestionsByAgeGroupModel.find({
    value: { $in: Array.from(newOptionValues) }
  }).distinct('value');

  const missingValues = [...newOptionValues].filter(v => !existingValues.includes(v));

  if (missingValues.length > 0) {
    const toInsert = missingValues.map(value => ({
      value,
      questions: [] 
    }));

    await QuestionsByAgeGroupModel.insertMany(toInsert);
  }
};

exports.processValueFile = async (value, questionsMap) => {

  const allQuestions = await primeQuestionsModel.find({ type: 'question' });
  const validValues = new Set();

  for (const q of allQuestions) {
    for (const opt of q.options) {
      if (opt.value) validValues.add(opt.value);
    }
  }

  if (!validValues.has(value)) {
    throw new Error(`Invalid file name. No matching value "${value}" found in prime-questions model`);
  }

  const updatedQuestions = [];

  for (const key of Object.keys(questionsMap)) {
    if (key === '__statements') continue;

    const questionNumber = parseInt(key.replace('Q', ''));
    const { questionText, options,type } = questionsMap[key];

    updatedQuestions.push({
      question_number: questionNumber,
      questionText,
      type: type,
      options
    });
  }

  const existing = await QuestionsByAgeGroupModel.findOne({ value });

  if (existing) {
    existing.questions = updatedQuestions;
    await existing.save();
  } else {
    await QuestionsByAgeGroupModel.create({
      value,
      questions: updatedQuestions
    });
  }
};
