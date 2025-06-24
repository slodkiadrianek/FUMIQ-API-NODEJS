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
      service: "gmail",
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
