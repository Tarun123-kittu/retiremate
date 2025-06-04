const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    label: { type: String },
    comment: { type: String }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
    question_number: { type: Number },
    questionText: { type: String },
    type: { type: String, enum: ['question', 'statement'], default: 'question' },
    free_text_comment: { type: String },
    options: [OptionSchema]
}, { _id: false });

const QuestionsByAgeGroupSchema = new mongoose.Schema({
    value: { type: String },
    questions: [QuestionSchema]
}, { timestamps: true });

const QuestionsByAgeGroup = mongoose.model( 'questions_by_age_group', QuestionsByAgeGroupSchema, 'questions_by_age_group');

module.exports = QuestionsByAgeGroup;
