import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Username must be given!' })
  @IsString({ message: 'Must be string!' })
  @MinLength(3, { message: 'Username should be equal or more than 3 letter' })
  @MaxLength(12, { message: 'Username should not be longer than 12 letter' })
  username: string;
  @IsNotEmpty({ message: 'Email must be given!' })
  @IsEmail()
  @MinLength(3, { message: 'Email should be equal or more than 3 letter' })
  @MaxLength(50, { message: 'Email should not be longer than 50 letter' })
  email: string;
  @IsNotEmpty({ message: 'Password! must be given!' })
  @IsString({ message: 'Must be string!' })
  @MinLength(3, { message: 'password should be equal or more than 3 letter' })
  @MaxLength(16, { message: 'password should not be longer than 16 letter' })
  password: string;
}
