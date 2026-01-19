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
      if (admin.apps.length) {
        this.logger.log('Firebase already initialized');
        return;
      }
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

      this.logger.log(' Firebase initialized successfully');
    } catch (error) {
      this.logger.error(' Failed to initialize Firebase', error);
      throw error;
    }
  }

  async sendViaTopic(userId: string, title: string, body: string) {
    await admin.messaging().send({
      topic: `user_${userId}`,
      notification: { title, body },
      data: {
        userId,
        type: 'PUSH',
      },
    });
  }

  async sendViaToken(tokens: string[], title: string, body: string) {
    return Promise.allSettled(
      tokens.map((token) =>
        admin.messaging().send({
          token,
          notification: { title, body },
          data: {
            type: 'PUSH',
          },
        }),
      ),
    );
  }

  async subscribeUserToTopic(userId: string, fcmToken: string): Promise<void> {
    try {
      const topic = `user_${userId}`;
      await admin.messaging().subscribeToTopic(fcmToken, topic);
      this.logger.log(`Subscribed token to ${topic}`);
    } catch (error) {
      this.logger.error('Error subscribing token to topic:', error);
    }
  }
}
