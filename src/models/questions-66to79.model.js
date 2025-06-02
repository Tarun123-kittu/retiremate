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

const Group66to79Model = mongoose.model('group-66-79', QuestionSchema, 'group-66-79');
module.exports = Group66to79Model
