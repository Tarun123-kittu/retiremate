const path = require('path');
const fs = require('fs');
const { uploadFinancialAdvisorData, getFinancialAdvisors } = require('../services/financialAdvisors.service');
const { errorResponse, successResponse } = require('../utils/responseHandler.util');
const resMessages = require('../constants/resMessages.constants');


exports.uploadFinancialAdvisorFile = async (req, res) => {
  try {
    const file = req.files?.file;

    if (!file) { return res.status(400).json(errorResponse("No file uploaded.")); }

    if (path.extname(file.name) !== '.xlsx') { return res.status(400).json(errorResponse("Only .xlsx files are allowed.")); }

    const match = file.name.match(/^financialAdvisors(\d+)\.xlsx$/);
    if (!match) {
      return res.status(400).json(errorResponse("Invalid filename format. Use: financialAdvisors{number}.xlsx"));
    }

    const fileNo = parseInt(match[1], 10);
    const uploadPath = path.join(__dirname, '../uploads', file.name);

    await file.mv(uploadPath);

    await uploadFinancialAdvisorData(uploadPath, fileNo);

    fs.unlinkSync(uploadPath);

    return res.status(200).json(successResponse("File uploaded and data saved successfully"));
  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(resMessages.generalError.somethingWentWrong, error.message));
  }
};


exports.getFinancialAdvisors = async (req, res) => {
  try {

    const fileNumber = parseInt(req.query.fileNumber) || 1
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 3

    const financialAdvisors = await getFinancialAdvisors(fileNumber, page, limit)

    return res.status(200).json(successResponse('Details fetched successfully.', financialAdvisors))
  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(resMessages.generalError.somethingWentWrong, error.message));
  }
}