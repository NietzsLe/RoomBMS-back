import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class NotEmptyCheckPipe<T> implements PipeTransform {
  transform(value: T, metadata: ArgumentMetadata) {
    if (value == null || value == undefined)
      throw new HttpException(
        `${metadata?.data} cannot be empty`,
        HttpStatus.BAD_REQUEST,
      );
    return value;
  }
}
