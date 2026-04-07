import { calendarClient } from '../auth.js';

export async function createFollowUpEvent(title: string, description: string, date: string, time: string = '09:00:00') {
  try {
    const startDateTime = new Date(`${date}T${time}Z`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const response = await calendarClient.events.insert({
      calendarId: 'primary', // Service account's own calendar — no DWD required
      requestBody: {
        summary: title,
        description,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
      },
    });

    return {
      status: 'Success',
      eventId: response.data.id || `MOCK-EVT-${Date.now()}`, // fallback id
    };
  } catch (error: any) {
    console.error('Failed to create calendar event:', error.message);
    // Throw to surface the error or optionally return a failure state.
    // We return a failure state structured output here.
    return {
      status: 'Failed',
      error: error.message
    };
  }
}