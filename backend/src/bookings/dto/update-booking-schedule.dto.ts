import { IsBoolean, IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateBookingScheduleDto {
  @IsDateString()
  bookingDate!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  timeSlot!: string;

  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}
