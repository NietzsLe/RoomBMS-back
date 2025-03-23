import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/models/image.model';
import { Repository } from 'typeorm';
import { isString } from '@nestjs/class-validator';
import {
  RoomImageConstraint,
  RoomImageProcess,
} from './constraints/roomImage.helper';
import { RoomConstraint } from './constraints/room.helper';
import { UserConstraint } from './constraints/user.helper';
import { Room } from 'src/models/room.model';

@Injectable()
export class RoomImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private constraint: RoomImageConstraint,
    private roomConstraint: RoomConstraint,
    private userContraint: UserConstraint,
    private process: RoomImageProcess,
  ) {}

  async softDelete(
    requestorRoleIDs: string[],
    requestorID: string,
    roomID: number,
    imageNames: string[],
  ) {
    const result = await Promise.all([
      this.constraint.ImagesIsAlive(imageNames, roomID),
      this.roomConstraint.RoomIsAlive(roomID),
    ]);
    if (result[1])
      this.userContraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result[1],
      );
    await this.imageRepository.softDelete(imageNames);
  }
  async trustSoftDeleteMany(room: Room) {
    const result = await this.imageRepository.find({
      where: {
        room: { roomID: room.roomID },
      },
      select: { imageName: true },
    });
    await this.imageRepository.softRemove(result);
  }
  async trustDeleteMany(room: Room) {
    const result = await this.imageRepository.find({
      where: {
        room: { roomID: room.roomID },
      },
      select: { imageName: true },
      withDeleted: true,
    });
    await this.imageRepository.remove(result);
  }

  async hardDelete(roomID: number, imageNames: string[]) {
    await Promise.all([
      this.constraint.ImagesIsNotAlive(imageNames, roomID),
      this.roomConstraint.RoomIsPersisted(roomID),
    ]);
    await Promise.all([
      this.imageRepository.delete(imageNames),
      this.process.DeleteFilesFromStorage(imageNames),
    ]);
  }
  async recover(roomID: number, imageNames: string[]) {
    await Promise.all([
      this.constraint.ImagesIsNotAlive(imageNames, roomID),
      this.roomConstraint.RoomIsPersisted(roomID),
    ]);
    await this.imageRepository.restore(imageNames);
  }

  async upload(
    roomID: number,
    extensionTypes: string[],
    files: Express.Multer.File[],
  ) {
    const room = await this.roomConstraint.RoomIsPersisted(roomID);
    const images = extensionTypes.map((item) => {
      const image = new Image();
      image.extensionType = item;
      if (room) image.room = room;
      return image;
    });
    this.constraint.FilesIsNotEmpty(files);
    const result = await this.imageRepository.insert(images);

    //console.log('@Service :\n', result.identifiers);
    await this.process.SaveFilesToStorage(result, files);
    return {
      imageNames: result.identifiers.map<string>((item) =>
        isString(item.imageName) ? item.imageName : '',
      ),
    };
  }
}
