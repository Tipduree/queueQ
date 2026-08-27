import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureBookingSchema();
  }

  /** Apply missing columns via DIRECT_URL (DDL must not go through Neon pooler). */
  private async ensureBookingSchema() {
    const directUrl = process.env.DIRECT_URL;
    if (!directUrl) {
      this.logger.warn('DIRECT_URL not set — skipping booking schema sync');
      return;
    }

    const migrator = new PrismaClient({
      datasources: { db: { url: directUrl } },
    });

    try {
      await migrator.$connect();
      await migrator.$executeRawUnsafe(
        `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "line_user_id" TEXT`,
      );
      this.logger.log('Booking schema synced (line_user_id via DIRECT_URL)');
    } catch (error) {
      this.logger.error('Booking schema sync failed', error);
    } finally {
      await migrator.$disconnect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
