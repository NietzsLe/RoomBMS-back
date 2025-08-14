import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/models/image.model';
import { InsertResult, IsNull, Not, Repository } from 'typeorm';
import { Room } from 'src/models/room.model';
import * as fs from 'fs';
import * as path from 'path';
import { isString } from '@nestjs/class-validator';

@Injectable()
export class RoomImageConstraint {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}
  async ImagesIsAlive(imageNames: string[], roomID: number) {
    const room = new Room();
    room.roomID = roomID;
    const images = await this.imageRepository.find({
      where: { room: room },
      select: { imageName: true },
    });
    const imageNameSets = new Set<string>(
      images.map((image) => image.imageName),
    );
    imageNames.every((name) => {
      if (!imageNameSets.has(name))
        throw new HttpException(`${name} is inactive`, HttpStatus.NOT_FOUND);
    });
    return images;
  }

  async ImagesIsNotAlive(imageNames: string[], roomID: number) {
    const room = new Room();
    room.roomID = roomID;
    const images = await this.imageRepository.find({
      where: { room: room, deletedAt: Not(IsNull()) },
      select: { imageName: true },
      withDeleted: true,
    });
    if (imageNames.length > images.length)
      throw new HttpException(
        'There are some imageNames that do not exist or is active',
        HttpStatus.NOT_FOUND,
      );
    return images;
  }

  FilesIsNotEmpty(files: Express.Multer.File[]) {
    if (files.length == 0) {
      throw new HttpException('Missing files', HttpStatus.BAD_REQUEST);
    }
  }

  async ImagesIsPersisted(imageNames: string[], roomID: number) {
    const room = new Room();
    room.roomID = roomID;
    const images = await this.imageRepository.find({
      where: { room: room },
      select: { imageName: true },
      withDeleted: true,
    });
    const imageNameSets = new Set<string>(
      images.map((image) => image.imageName),
    );
    imageNames.every((name) => {
      if (!imageNameSets.has(name))
        throw new HttpException(`${name} does not exist`, HttpStatus.NOT_FOUND);
    });
    return images;
  }
}

@Injectable()
export class RoomImageProcess {
  async SaveFilesToStorage(result: InsertResult, files: Express.Multer.File[]) {
    await Promise.all(
      result.identifiers.map((item, idx) => {
        return fs.promises.writeFile(
          path.join(
            process.env.FILE_SYSTEM_PATH ?? '',
            'rooms',
            isString(item.imageName) ? item.imageName : '',
          ),
          files[idx]?.buffer,
        );
      }),
    );
  }
  async DeleteFilesFromStorage(imageNames: string[]) {
    await Promise.all(
      imageNames.map((item) => {
        const filePath = path.join(
          process.env.FILE_SYSTEM_PATH ?? '',
          'rooms',
          item,
        );
        return fs.promises.unlink(filePath);
      }),
    );
  }
}
