const twilio = require('twilio');

const sendEmergencySMS = async (req, res) => {
    try {
        const { location, type, description } = req.body;

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        const adminPhone = process.env.ADMIN_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone || !adminPhone) {
            console.warn("Twilio credentials not fully configured. Skipping SMS.");
            return res.status(200).json({ message: "SMS skipped (Credentials missing)" });
        }

        const client = twilio(accountSid, authToken);

        const messageBody = `🚨 CRITICAL EMERGENCY 🚨\nType: ${type}\nLocation: ${location}\nDetails: ${description}\n\nPlease dispatch teams immediately via the RescueNet Admin Dashboard.`;

        await client.messages.create({
            body: messageBody,
            from: twilioPhone,
            to: adminPhone
        });

        res.status(200).json({ success: true, message: "Emergency SMS sent to Admin" });

    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ success: false, error: "Failed to send SMS" });
    }
};

module.exports = { sendEmergencySMS };
