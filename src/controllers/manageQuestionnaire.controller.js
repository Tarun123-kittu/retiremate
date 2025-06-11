const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { errorResponse, successResponse } = require("../utils/responseHandler.util")
const resMessages = require("../constants/resMessages.constants")
const { processVendorFile, processValueFile } = require('../services/manageQuestionnire.service');


exports.uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) { return res.status(400).json(errorResponse('No file uploaded')); }

    const file = req.files.file;

    if (path.extname(file.name) !== '.xlsx') {
      return res.status(400).json(errorResponse('Only .xlsx files are allowed.'));
    }

    const fileName = path.parse(file.name).name;
    const uploadPath = path.join(__dirname, '../uploads', file.name);
    await file.mv(uploadPath);

    const workbook = XLSX.readFile(uploadPath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    const questionsMap = {};
    const pendingStatements = {};

    for (const row of data) {
      const qid = row['Q#']?.trim();
      const questionText = row['Question']?.trim();
      const optionLabel = row['Option']?.trim();
      const comment = row['Comment']?.trim();

      if (!qid || !questionText) continue;

      if (qid.startsWith('STMT')) {
        const stmtNum = qid.match(/\d+/)?.[0];
        if (!stmtNum) continue;

        if (!pendingStatements[stmtNum]) pendingStatements[stmtNum] = [];
        pendingStatements[stmtNum].push(questionText);

        const questionKey = `Q${stmtNum}`;
        if (questionsMap[questionKey]) {
          questionsMap[questionKey].system_greeting = pendingStatements[stmtNum];
        }

      } else if (qid.startsWith('Q')) {
        const qNum = qid.match(/\d+/)?.[0];
        const isFreeText = optionLabel?.includes('(Free Text)');

        if (!questionsMap[qid]) {
          questionsMap[qid] = {
            quiz_no: qNum,
            questionText,
            options: [],
            type: isFreeText ? 'statement' : 'question',
            system_greeting: pendingStatements[qNum] || []
          };
        }

        if (isFreeText) {
          questionsMap[qid].type = 'statement';
        }

        if (optionLabel || comment) {
          questionsMap[qid].options.push({
            value: optionLabel.replace(/[\s-]+/g, '_').toLowerCase(),
            label: optionLabel,
            comment: comment || ''
          });
        }
      }
    }


    if (file.name === 'VendorCommonQuestions.xlsx') {
      await processVendorFile(questionsMap);
    } else {
      await processValueFile(fileName, questionsMap);
    }

    fs.unlinkSync(uploadPath);
    return res.status(200).json(successResponse('Questions successfully processed and updated.'))

  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(resMessages.generalError.somethingWentWrong, error.message))
  }
};
