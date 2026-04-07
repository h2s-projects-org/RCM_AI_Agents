import { sheetsClient } from '../auth.js';

// Requires a predefined Google Sheet ID (ideally set in .env)
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || 'mock_spreadsheet_id_for_testing';

export async function appendExecutionRow(workflowId: string, claimId: string, status: string, summary: string) {
  try {
    const timestamp = new Date().toISOString();

    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [timestamp, workflowId, claimId, status, summary]
        ]
      }
    });

    return {
      status: 'Success',
      rowId: `ROW-${response.data.updates?.updatedRows || Date.now()}`
    };
  } catch (error: any) {
    console.error('Failed to append to Google sheet:', error.message);
    return {
      status: 'Failed',
      error: error.message
    };
  }
}