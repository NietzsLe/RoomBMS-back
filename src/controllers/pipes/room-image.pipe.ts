import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { extname } from 'path';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    // "value" is an object containing the file's attributes and metadata
    // console.log('@Pipe: \n', files);
    files.forEach((file) => {
      const ext = extname(file.originalname);
      if (
        (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') ||
        (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png')
      ) {
        throw new HttpException(
          'Only images are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }
    });
    return files;
  }
}
