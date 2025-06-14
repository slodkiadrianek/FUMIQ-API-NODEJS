import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer/index.js";

export class EmailService {
  transporter: Mail;

  constructor(
    private user: string,
    private pass: string,
    private fromEmail: string,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      auth: {
        user: this.user,
        pass: this.pass,
      },
    });
  }
  sendEmail = async (to: string, subject: string, message: string) => {
    await this.transporter.sendMail({
      from: this.fromEmail,
      to,
      subject,
      text: message,
    });
  };
}
