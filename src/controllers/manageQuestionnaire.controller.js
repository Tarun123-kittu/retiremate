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

    for (const row of data) {
      const qid = row['Q#'];
      const questionText = row['Question'];
      const optionLabel = row['Option'];
      const comment = row['Comment'];

      if (!qid || !questionText) continue;

      const isFreeText =  optionLabel.includes('(Free Text)');
   

      if (qid.startsWith('STMT')) {
        if (!questionsMap['__statements']) questionsMap['__statements'] = [];
        questionsMap['__statements'].push(questionText);
      } else if (qid.startsWith('Q')) {
        if (!questionsMap[qid]) {
          questionsMap[qid] = {
            questionText,
            options: [],
            type: isFreeText==true ? 'statement' : 'question'
          };
        }
        if (isFreeText) {
          questionsMap[qid].type = 'statement';
        }

        questionsMap[qid].options.push({
          value: optionLabel.trim().replace(/[\s-]+/g, '_').toLowerCase(),
          label: optionLabel,
          comment: comment || ''
        });
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
