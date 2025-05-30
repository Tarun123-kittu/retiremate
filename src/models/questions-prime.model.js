const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: String, required: true },    
  label: { type: String, required: true },    
  comment: { type: String },
});

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['question', 'statement'], default: 'question' },
  options: [OptionSchema],
},{timestamps:true});

let primeQuestionsModel = mongoose.model('prime-questions', QuestionSchema);
module.exports = primeQuestionsModel
