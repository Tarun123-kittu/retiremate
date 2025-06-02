const primeQuestionsModel = require('../models/questions-prime.model')
const LessThan40Model = require("../models/questions-lessthan40.model")
const Group40to49Model = require("../models/questions-40to49.model")
const Group50to59Model = require('../models/questions-50to59.model')
const Group60to65Model = require('../models/questions-60to65.model')
const Group66to79Model = require('../models/questions-66to79.model')
const Group80plus = require('../models/questions-80plus.model')



const getPrimeQuestions = async () => {
    try {
        let questions = await primeQuestionsModel.find().select('questionText type options questionText')
        return questions
    } catch (error) {
        throw error.message
    }
}

const getSystemGreetings = async () => {
    try {
        let questions = await primeQuestionsModel.find().select('system_greetings')
        return questions
    } catch (error) {
        throw error.message
    }
}



const modelMap = {
    less_than_40: LessThan40Model,
    '40_49': Group40to49Model,
    '50_59':Group50to59Model,
    '60_65':Group60to65Model,
    '66_79':Group66to79Model,
    '80_plus':Group80plus
};

const getNextQuestion = async (prime_value, next_question) => {
    try {
        const Model = modelMap[prime_value];
        if (!Model) throw new Error("Model not found for prime value.");

        const question = await Model.findOne({ question_number: Number(next_question) });

        if (!question) throw new Error("Question not found.");
        return question;
    } catch (error) {
        throw error.message
    }

};

module.exports = { getPrimeQuestions, getNextQuestion, getSystemGreetings };
