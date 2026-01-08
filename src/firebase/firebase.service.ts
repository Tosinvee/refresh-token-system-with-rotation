import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      // Only read JSON via readFileSync
      const path = join(__dirname, '../../practical-firebase-config.json');
      const raw = readFileSync(path, 'utf8');
      const serviceAccount = JSON.parse(raw);

      // Fix Windows newline
      serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        '\n',
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('🔥 Firebase initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Firebase', error);
      throw error;
    }
  }

  async sendPushToken(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!token) {
      throw new Error('FCM token is required');
    }

    const message: admin.messaging.Message = {
      token,
      notification: { title, body },
      data: data || {},
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`✅ FCM sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error('❌ FCM failed', error);
      throw error;
    }
  }
}
