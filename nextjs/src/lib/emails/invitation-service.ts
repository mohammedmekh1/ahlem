import nodemailer from 'nodemailer';

export async function sendInvitationEmail(email: string, orgName: string, role: string, token: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?token=${token}`;
  const productName = process.env.NEXT_PUBLIC_PRODUCTNAME || "منصة أحلام";

  // Configuration for Gmail/SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Your App Password
    },
  });

  const mailOptions = {
    from: `"${productName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: `دعوة للانضمام إلى ${orgName}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>مرحباً بك في ${productName}</h2>
        <p>تم دعوتك للانضمام إلى منظمة <strong>${orgName}</strong> بدور <strong>${role}</strong>.</p>
        <p>يرجى الضغط على الرابط التالي لإنشاء حسابك وقبول الدعوة:</p>
        <p style="margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">قبول الدعوة والبدء</a>
        </p>
        <p>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذا البريد.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">تم إرسال هذا البريد من قبل ${productName}. الجزائر.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    // Log details for debugging in mock environment
    console.log(`Fallback Link: ${inviteUrl}`);
    return { success: false, error };
  }
}
