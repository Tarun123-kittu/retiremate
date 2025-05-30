const mongoose = require('mongoose')

const OptionSchema = new mongoose.Schema({ 
  label: { type: String},    
  comment: { type: String },
});

const QuestionSchema = new mongoose.Schema({
  question_number:{type:Number},
  question_text:{type:String},
  type: { type: String, enum: ['question', 'statement'], default: 'question' },
  free_text_comment:{type:String},
  options: [OptionSchema],
},{timestamps:true})

const LessThan40Model = mongoose.model('LessThan40', QuestionSchema, 'less-than-40');
module.exports = LessThan40Model


