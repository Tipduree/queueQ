import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreateBookingDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  serviceSlugs!: string[];

  @IsDateString()
  bookingDate!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  timeSlot!: string;

  @IsString()
  guestName!: string;

  @IsString()
  guestPhone!: string;

  @IsInt()
  @Min(1)
  @Max(4)
  guestCount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
