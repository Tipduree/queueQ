import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** Debug: which columns Render's DB connection actually sees on bookings. */
  @Get('health/db')
  async getDbHealth() {
    const columns = await this.prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'bookings'
      ORDER BY column_name
    `;
    const names = columns.map((c) => c.column_name);
    return {
      hasLineUserId: names.includes('line_user_id'),
      bookingColumns: names,
    };
  }

  /** Debug: verify ADMIN_API_KEY is loaded (does not expose the key). */
  @Get('health/admin')
  getAdminHealth() {
    const raw = process.env.ADMIN_API_KEY;
    return {
      adminApiKeyConfigured: Boolean(raw?.trim()),
      adminKeyPresent: raw !== undefined,
      adminKeyLength: raw?.length ?? 0,
      adminEnvKeys: Object.keys(process.env).filter((key) =>
        key.toUpperCase().includes('ADMIN'),
      ),
    };
  }
}
