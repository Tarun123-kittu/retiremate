const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  value: { type: String},    
  label: { type: String},    
  comment: { type: String },
},{_id: false});

const QuestionSchema = new mongoose.Schema({
  fileName:{type:String},
  questionText: { type: String},
  type: { type: String, enum: ['question', 'statement'], default: 'question' },
  options: [OptionSchema],
  system_greetings: [String] 

},{timestamps:true});

let primeQuestionsModel = mongoose.model('prime-questions', QuestionSchema);
module.exports = primeQuestionsModel
