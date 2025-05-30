const express = require('express')
const router = express.Router();
const questionnarieController = require('../../controllers/questionnaireController')

router.get('/get-prime-questions',questionnarieController.getPrimeQuestions)

module.exports = router