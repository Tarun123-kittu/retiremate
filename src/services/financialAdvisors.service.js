const XLSX = require('xlsx');
const FinancialAdvisor = require('../models/financial-advisors.model');


exports.uploadFinancialAdvisorData = async (filePath, fileNo) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const details = jsonData.map(row => ({
      primary_business_name: row['Primary Business Name'],
      main_office_city: row['Main Office City'],
      main_office_state: row['Main Office State'],
    }));

    await FinancialAdvisor.deleteOne({ financial_Advisor_file_no: fileNo });

    await FinancialAdvisor.create({
      financial_Advisor_file_no: fileNo,
      details
    });
  } catch (error) {
    console.error('Error in upload financial advisors function:', error);
    throw new Error(error.message || 'Failed to upload financial advisor file details');
  }
};


exports.getFinancialAdvisors = async (fileNumber, page = 1, limit = 3) => {
  try {
    const skip = (page - 1) * limit;

    const financialAdvisors = await FinancialAdvisor.aggregate([
      { $match: { financial_Advisor_file_no: fileNumber } },
      { $unwind: "$details" },
      { $skip: skip },
      { $limit: limit },
      { $replaceRoot: { newRoot: "$details" } }
    ]);

    const totalCountAgg = await FinancialAdvisor.aggregate([
      { $match: { financial_Advisor_file_no: fileNumber } },
      { $project: { total: { $size: "$details" } } }
    ]);

    const total = totalCountAgg[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      financialAdvisors,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    };

  } catch (error) {
    console.error('Error in upload financial advisors function:', error);
    throw new Error(error.message || 'Failed to upload financial advisor file details');
  }
}