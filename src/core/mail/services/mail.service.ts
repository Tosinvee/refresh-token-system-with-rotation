import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  private async compileTemplate(
    templateName: string,
    variables: Record<string, any>,
  ) {
    //const filePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    const filePath = path.join(
      __dirname,
      '..',
      'templates',
      `${templateName}.hbs`,
    );

    this.logger.log(`Looking for template at: ${filePath}`);

    const templateExists = await fs.pathExists(filePath);
    if (!templateExists) throw new Error(`Template ${templateName} not found`);

    const templateContent = await fs.readFile(filePath, 'utf8');
    const compiled = handlebars.compile(templateContent);
    return compiled(variables);
  }

  async sendMail(
    to: string,
    subject: string,
    template: string,
    variables: Record<string, any>,
  ) {
    try {
      const html = await this.compileTemplate(template, variables);

      const info = await this.transporter.sendMail({
        from: `"Your App"<${process.env.SMTP_USERNAME}> `,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
