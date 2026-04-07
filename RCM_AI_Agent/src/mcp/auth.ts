import { google } from 'googleapis';
import { config } from '../config.js';

// Setup Google Auth using Application Default Credentials
// In GCP (Cloud Run) this automatically assumes the service account
// Locally, it relies on GOOGLE_APPLICATION_CREDENTIALS in your .env
export const auth = new google.auth.GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets',
    // Tasks API scope
    'https://www.googleapis.com/auth/tasks' 
  ]
});

// Initialize individual service clients
export const calendarClient = google.calendar({ version: 'v3', auth });
export const sheetsClient = google.sheets({ version: 'v4', auth });
export const tasksClient = google.tasks({ version: 'v1', auth });

export async function checkAuth() {
  try {
    const client = await auth.getClient();
    return !!client;
  } catch (error) {
    console.error('❌ Failed to authenticate with Google APIs:', error);
    return false;
  }
}