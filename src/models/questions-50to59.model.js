const mongoose = require('mongoose')

const OptionSchema = new mongoose.Schema({ 
  label: { type: String},    
  comment: { type: String },
});

const QuestionSchema = new mongoose.Schema({
  question_number:{type:Number},
  questionText:{type:String},
  type: { type: String, enum: ['question', 'statement'], default: 'question' },
  free_text_comment:{type:String},
  options: [OptionSchema],
},{timestamps:true})

const Group50to59Model = mongoose.model('group-50-59', QuestionSchema, 'group-50-59');
module.exports = Group50to59Model
