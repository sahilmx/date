// api/send-invitation.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { response } = req.body;

  if (!response) {
    return res.status(400).json({ error: 'Missing response field' });
  }

  // Only send email if accepted
  if (response !== 'accepted') {
    return res.status(200).json({ 
      success: true, 
      message: 'Response recorded (no email sent)' 
    });
  }

  // Get guest email from environment variables
  const guestEmail = process.env.GUEST_EMAIL;
  const guestName = process.env.GUEST_NAME || 'Beautiful';

  if (!guestEmail) {
    return res.status(500).json({ error: 'Guest email not configured in environment variables' });
  }

  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use Gmail App Password (16 characters)
      },
    });

    // Email content for acceptance
    const emailContent = {
      subject: '🎉 YES to Our Romantic Weekend! 💕',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px;">
          <div style="background: white; padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #2c3e50; margin-bottom: 20px; font-size: 2.5rem;">💕 It's Official! 💕</h1>
            <p style="font-size: 1.2rem; color: #7f8c8d; margin-bottom: 30px;">
              Dear ${guestName}, my heart is absolutely overjoyed that you said YES!
            </p>
            
            <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 25px; border-radius: 15px; margin: 25px 0; color: #2c3e50;">
              <h3 style="margin-bottom: 15px; color: #2c3e50;">✨ Our Weekend Itinerary ✨</h3>
              <p><strong>📅 This Saturday:</strong></p>
              <ul style="text-align: left; line-height: 1.8;">
                <li>Morning: Breakfast at that cozy café you love</li>
                <li>Afternoon: Surprise adventure (dress comfortably!)</li>
                <li>Evening: Romantic dinner & stargazing</li>
              </ul>
              
              <p style="margin-top: 20px;"><strong>🌙 Saturday Night:</strong></p>
              <ul style="text-align: left; line-height: 1.8;">
                <li>Cozy accommodation with a beautiful view</li>
                <li>Late night conversations & sweet dreams</li>
              </ul>
              
              <p style="margin-top: 20px;"><strong>☀️ Sunday:</strong></p>
              <ul style="text-align: left; line-height: 1.8;">
                <li>Leisurely morning & brunch</li>
                <li>Memory-making activities</li>
                <li>Sweet journey home</li>
              </ul>
            </div>
            
            <div style="background: rgba(102, 126, 234, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h4 style="color: #667eea; margin-bottom: 10px;">What to Bring:</h4>
              <p style="color: #2c3e50; line-height: 1.6;">
                Just yourself, comfortable clothes, your beautiful smile, and an open heart for adventure! 
                I'll take care of everything else. 💝
              </p>
            </div>
            
            <p style="font-size: 1.1rem; color: #2c3e50; line-height: 1.6; margin-top: 30px;">
              I can't wait to create beautiful memories with you this weekend. 
              Get ready for laughter, romance, and pure magic! ✨
            </p>
            
            <p style="font-style: italic; color: #7f8c8d; margin-top: 20px;">
              With all my love and excitement,<br>
              Your weekend adventure planner 💕
            </p>
          </div>
        </div>
      `
    };

    // Send email to the guest
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: guestEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Send notification to the sender (you)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: `🎉 ${guestName} said YES to the romantic weekend!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Great News!</h2>
          <p><strong>Name:</strong> ${guestName}</p>
          <p><strong>Email:</strong> ${guestEmail}</p>
          <p><strong>Response:</strong> Accepted the invitation! 💕</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Invitation email sent successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}