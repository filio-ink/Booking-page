import { Resend } from "resend";
import { toZonedTime, format as formatTz } from "date-fns-tz";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@bookingpage.com";

interface BookingEmailData {
  guestName: string;
  guestEmail: string;
  hostName: string;
  hostEmail: string;
  eventTitle: string;
  startTimeUtc: string;
  endTimeUtc: string;
  guestTimezone: string;
  hostTimezone: string;
  notes?: string | null;
  bookingId: string;
}

function formatMeetingTime(utcTime: string, timezone: string): string {
  const date = toZonedTime(new Date(utcTime), timezone);
  return formatTz(date, "EEEE, MMMM d, yyyy 'at' h:mm a zzz", { timeZone: timezone });
}

export async function sendGuestConfirmationEmail(data: BookingEmailData) {
  const formattedTime = formatMeetingTime(data.startTimeUtc, data.guestTimezone);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.guestEmail,
    subject: `Confirmed: ${data.eventTitle} with ${data.hostName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
          <div style="background: #3B82F6; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Meeting Confirmed!</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px;">Hi <strong>${data.guestName}</strong>,</p>
            <p>Your meeting has been scheduled. Here are the details:</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Meeting</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.eventTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Host</td>
                  <td style="padding: 8px 0;">${data.hostName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time</td>
                  <td style="padding: 8px 0; font-weight: 600;">${formattedTime}</td>
                </tr>
                ${data.notes ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Notes</td>
                  <td style="padding: 8px 0;">${data.notes}</td>
                </tr>` : ""}
              </table>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              A calendar invitation has been sent to your email.
              If you need to cancel or reschedule, please contact ${data.hostName} at ${data.hostEmail}.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendHostNotificationEmail(data: BookingEmailData) {
  const formattedTime = formatMeetingTime(data.startTimeUtc, data.hostTimezone);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.hostEmail,
    subject: `New booking: ${data.eventTitle} with ${data.guestName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
          <div style="background: #10B981; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Booking!</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px;">Hi <strong>${data.hostName}</strong>,</p>
            <p>You have a new meeting booking. Here are the details:</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Meeting</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.eventTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guest</td>
                  <td style="padding: 8px 0; font-weight: 600;">${data.guestName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Guest Email</td>
                  <td style="padding: 8px 0;"><a href="mailto:${data.guestEmail}" style="color: #3B82F6;">${data.guestEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date & Time</td>
                  <td style="padding: 8px 0; font-weight: 600;">${formattedTime}</td>
                </tr>
                ${data.notes ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Notes</td>
                  <td style="padding: 8px 0;">${data.notes}</td>
                </tr>` : ""}
              </table>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This event has been added to your Google Calendar.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}
