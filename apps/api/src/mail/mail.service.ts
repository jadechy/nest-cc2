import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendOtp(email: string, otp: string, durationMin: number) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Ton code de connexion',
      html: `<p>Ton code : <strong>${otp}</strong></p><p>Valable ${durationMin} minutes.</p>`,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://${process.env.APP_URL}/auth/verify-email?token=${token}`;
    await this.mailer.sendMail({
      to: email,
      subject: 'Vérifie ton email',
      html: `<p>Clique ici pour vérifier ton compte : <a href="${url}">${url}</a></p>`,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const url = `http://${process.env.APP_URL}/auth/reset-password?token=${token}`;
    await this.mailer.sendMail({
      to: email,
      subject: 'Réinitialisation de ton mot de passe',
      html: `<p>Clique ici pour réinitialiser ton mot de passe : <a href="${url}">${url}</a></p>`,
    });
  }
}