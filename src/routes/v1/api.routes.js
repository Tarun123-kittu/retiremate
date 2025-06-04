const express = require('express')
const router = express.Router();
const questionnarieController = require('../../controllers/questionnaireController')
const manageQuestionnire = require("../../controllers/manageQuestionnaire.controller")

//questionnaire
router.get('/get-prime-questions',questionnarieController.getPrimeQuestions)
router.get('/get-next-question',questionnarieController.getNextQuestion)

//mangage questionnaire
router.post('/uploadFile',manageQuestionnire.uploadFile)


module.exports = router