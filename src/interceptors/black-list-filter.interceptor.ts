import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { HttpMethodToPerm, PermTypeEnum } from 'src/services/auth.service';

export class BlackListFilterInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // console.log('Before...');
    // const now = Date.now();
    const request: Request = context.switchToHttp().getRequest();
    const perm = HttpMethodToPerm(request.method);
    const blackList: string[] = request['resourceBlackListAttrs'] as string[];
    if (
      (perm == PermTypeEnum.UPDATE || perm == PermTypeEnum.CREATE) &&
      request.body &&
      blackList
    ) {
      const classProperties = Object.keys(request.body as object);
      const invalidProperties = classProperties.filter((property) =>
        blackList.includes(property),
      );
      // console.log(request.body);

      if (invalidProperties.length > 0) {
        throw new HttpException(
          `You do not have permission to manipulate the property ${invalidProperties.join(', ')}`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return handler.handle().pipe(
      map((data: object[]) => {
        // console.log(
        //   'After....',
        //   'Guard: ',
        //   Date.now() - request['requestGuardStartTime'],
        //   '-Interceptor: ',
        //   Date.now() - now,
        // );
        return data;
      }),
    );
  }
}
