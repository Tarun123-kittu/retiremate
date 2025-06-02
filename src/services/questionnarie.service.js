const primeQuestionsModel = require('../models/questions-prime.model')
const LessThan40Model = require("../models/questions-lessthan40.model")
const Group40to49Model = require("../models/questions-40to49.model")



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
