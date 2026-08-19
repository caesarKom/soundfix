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

  async sendOTP(
    email: string,
    otp: string,
    username = '',
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: this.config.get('EMAIL_FROM'),
      to: email,
      subject: 'Your verification code - Soundfix',
      html: `
        <h1>Verification Code</h1>
        <p>Dear ${username},</p>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>Please enter this code to complete your verification.</p>
        <p>Best regards,</p>
        <p>The Soundfix Team</p>
      `,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(
    email: string,
    username: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: this.config.get('EMAIL_FROM'),
      to: email,
      subject: 'Welcome to Soundfix',
      html: `<p>Hi ${username},</p>
              <p>Welcome to Soundfix! We're excited to have you on board.</p>
              <p>Feel free to reach out if you have any questions.</p>
              <p>Best regards,</p>
              <p>The Soundfix Team</p>`,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const mailOptions = {
      from: this.config.get('EMAIL_FROM'),
      to: email,
      subject: 'Password Reset Request - Soundfix',
      html: `<p>Hi,</p>
              <p>You have requested a password reset for your Soundfix account.</p>
              <p>Please click on the following link to reset your password:</p>
              <p><a href="${this.config.get('FRONTEND_URL')}/reset-password/${resetToken}">Reset Password</a></p>
              <p>If you did not request a password reset, please ignore this email.</p>
              <p>Best regards,</p>
              <p>The Soundfix Team</p>`,
    };
    return this.transporter.sendMail(mailOptions);
  }
}
