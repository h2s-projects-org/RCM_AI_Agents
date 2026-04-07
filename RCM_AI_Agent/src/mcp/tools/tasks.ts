import { calendarClient } from '../auth.js';

// Convert a task into a Google Calendar Event (Workaround for Tasks API Service Account limitation)
export async function createTask(title: string, notes: string, dueDate: string) {
  try {
    const startDateTime = new Date(dueDate);
    // If the dueDate doesn't specify a time, default to 9:00 AM
    if (startDateTime.getHours() === 0 && startDateTime.getMinutes() === 0) {
      startDateTime.setHours(9, 0, 0, 0);
    }
    
    // Create a 30-minute block for the "task"
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    const response = await calendarClient.events.insert({
      calendarId: 'primary', // Service account's own calendar — no DWD required
      requestBody: {
        summary: `Task: ${title}`,
        description: notes,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
      }
    });

    return {
      status: 'Success',
      taskId: response.data.id || `MOCK-TASK-${Date.now()}`
    };
  } catch (error: any) {
    console.error('Failed to create task (as calendar event):', error.message);
    return {
      status: 'Failed',
      error: error.message
    };
  }
}