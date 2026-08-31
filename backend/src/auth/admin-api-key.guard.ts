import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const configured = process.env.ADMIN_API_KEY?.trim();
    if (!configured) {
      throw new UnauthorizedException('Admin API is not configured');
    }

    const header = request.headers.authorization;
    const token =
      header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;

    if (!token || token !== configured) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    return true;
  }
}
