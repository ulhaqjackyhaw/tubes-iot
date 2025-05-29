// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const twilio = require("twilio");

let accountSid, authToken, twilioPhoneNumber;
try {
    accountSid = functions.config().twilio.account_sid;
    authToken = functions.config().twilio.auth_token;
    twilioPhoneNumber = functions.config().twilio.phone_number;
} catch (error) {
    console.error("Twilio config not set. Run: firebase functions:config:set twilio.account_sid=... etc.");
}

const RECIPIENT_PHONE_NUMBER = "whatsapp:+6289524174285"; // << GANTI INI

let twilioClient;
if (accountSid && authToken) {
    twilioClient = new twilio(accountSid, authToken);
} else {
    console.warn("Twilio client not initialized due to missing configuration.");
}

exports.fireAlertNotification = functions.database.ref("/fire_detection")
.onWrite(async (change, _context) => { // Tambahkan underscore pada context
// ... (your existing function logic)
        const beforeData = change.before.val();
        const afterData = change.after.val();

        if (!afterData) {
            console.log("Data deleted or not present. No action.");
            return null;
        }

        const isNowBahaya = afterData.fuzzy_status === "BAHAYA" || afterData.alarm_active === true;
        const wasBahaya = beforeData ? (beforeData.fuzzy_status === "BAHAYA" || beforeData.alarm_active === true) : false;

        console.log(`Previous state was BAHAYA: ${wasBahaya}, Current state is BAHAYA: ${isNowBahaya}`);
        console.log(`Fuzzy Status: ${afterData.fuzzy_status}, Alarm Active: ${afterData.alarm_active}`);

        if (isNowBahaya && !wasBahaya) {
            if (!twilioClient) {
                console.error("Twilio client not initialized. Cannot send message. Check Firebase Functions configuration.");
                return null;
            }
            if (RECIPIENT_PHONE_NUMBER === "whatsapp:+6289524174285") {
                console.error("Recipient phone number not set. Please edit functions/index.js and set RECIPIENT_PHONE_NUMBER.");
                return null;
            }

            const timestamp = afterData.timestamp ? new Date(afterData.timestamp).toLocaleString("id-ID") : "N/A";
            const messageBody = `🔥 PERINGATAN KEBAKARAN! 🔥
Status: ${afterData.fuzzy_status}
Alarm: ${afterData.alarm_active ? "AKTIF" : "TIDAK AKTIF"}
Suhu: ${parseFloat(afterData.temperature || 0).toFixed(1)}°C
Kelembaban: ${parseFloat(afterData.humidity || 0).toFixed(1)}%
Gas: ${parseInt(afterData.gas || 0)} ppm
Waktu: ${timestamp}
Segera lakukan pengecekan!`;

            console.log(`Attempting to send WhatsApp message to ${RECIPIENT_PHONE_NUMBER}`);

            try {
                const message = await twilioClient.messages.create({
                    body: messageBody,
                    from: twilioPhoneNumber,
                    to: RECIPIENT_PHONE_NUMBER
                });
                console.log("WhatsApp message sent successfully! SID:", message.sid);
            } catch (error) {
                console.error("Error sending WhatsApp message via Twilio:", error);
            }
            return null;

        } else if (!isNowBahaya && wasBahaya) {
            console.log("Status changed from BAHAYA to a safer state. No alert sent, but you could implement an \"all clear\" message here.");
        } else {
            console.log("No relevant status change for BAHAYA notification, or status remains BAHAYA.");
        }
        return null;
    });

// If you had other functions like onRequest or logger, and don't need them,
// ensure their 'require' statements at the top are also removed.
// For example, if you had:
// const {onRequest} = require("firebase-functions/v2/https");
// const {logger} = require("firebase-functions");
// ...and you are not using them, remove these lines.