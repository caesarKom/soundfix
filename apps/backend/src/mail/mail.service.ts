// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EnvConfig } from '../config/env.schema';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService<EnvConfig, true>) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('EMAIL_HOST'),
      port: parseInt(this.config.get('EMAIL_PORT')),
      secure: false,
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendOTP(email: string, otp: string, username = ''): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: this.config.get('EMAIL_FROM'),
      to: email,
      subject: 'Your verification code - Spotify Clone',
      html: `...TUTAJ WKLEJ TWÓJ KOD HTML Z EXPRESSA...`,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, username: string) {
    // KOD Z EXPRESSA...
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    // KOD Z EXPRESSA...
  }
}
