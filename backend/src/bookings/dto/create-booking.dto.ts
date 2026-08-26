import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsNumberString,
  Length,
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

  @IsNumberString()
  @Length(10, 10)
  guestPhone!: string;

  @IsInt()
  @Min(1)
  @Max(4)
  guestCount!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  lineUserId?: string;
}
