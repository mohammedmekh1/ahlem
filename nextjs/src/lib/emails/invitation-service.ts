// Placeholder for Email Service (can be easily replaced with Nodemailer/Resend)

export async function sendInvitationEmail(email: string, orgName: string, role: string, token: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/register?token=${token}`;

  console.log(`
    --- MOCK EMAIL SENT ---
    To: ${email}
    Subject: دعوة للانضمام إلى ${orgName}
    Body: تم دعوتك للانضمام إلى منظمة ${orgName} بدور ${role}.
    رابط القبول: ${inviteUrl}
    ------------------------
  `);

  // Integration example (commented out):
  /*
  const nodemailer = require('nodemailer');
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"منصة أحلام" <no-reply@ahlem.dz>',
    to: email,
    subject: `دعوة للانضمام إلى ${orgName}`,
    html: `<p>تم دعوتك للانضمام إلى منظمة ${orgName} بدور ${role}.</p>
           <p><a href="${inviteUrl}">اضغط هنا لقبول الدعوة وإنشاء حسابك</a></p>`,
  });
  */
}
