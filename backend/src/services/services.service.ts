import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.service.findUnique({
      where: { slug },
    });
  }
}
