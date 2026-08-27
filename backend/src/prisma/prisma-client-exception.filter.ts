import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Prisma ${exception.code}: ${exception.message}`,
      exception.stack,
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists';
        break;
      case 'P2021': {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        const table = String(exception.meta?.modelName ?? exception.meta?.table ?? 'unknown');
        message = `Database table "${table}" is missing — run sync SQL in Neon SQL Editor (primary branch)`;
        break;
      }
      case 'P2022': {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        const column = String(exception.meta?.column ?? 'unknown');
        message = `Database column "${column}" is missing — add it in Neon SQL Editor on the primary branch`;
        break;
      }
      default:
        message = `Database error (${exception.code})`;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.code,
    });
  }
}
