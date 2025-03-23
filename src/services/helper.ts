// import { getMetadataStorage } from '@nestjs/class-validator';
import type { MetadataStorage } from '@nestjs/class-transformer/types/MetadataStorage';
import { defaultMetadataStorage } from '@nestjs/class-transformer/cjs/storage';

export function createFindOptionSelectWithBlacklist(
  dto: any,
  blacklist: string[],
) {
  const properties = (
    defaultMetadataStorage as MetadataStorage
  ).getExposedMetadatas(dto);

  const select = {};
  const relations = {};
  properties.forEach((property) => {
    if (
      property.options.groups &&
      property.options.groups.includes('relation')
    ) {
      if (property.options.name) relations[property.options.name] = true;
      else if (property.propertyName) relations[property.propertyName] = true;
    } else {
      if (property.options.name) select[property.options.name] = true;
      else if (property.propertyName) select[property.propertyName] = true;
    }
  });
  blacklist.forEach((item) => {
    delete select[item];
    delete relations[item];
  });

  // properties = (defaultMetadataStorage as MetadataStorage).getExposedProperties(
  //   dto,
  //   TransformationType.CLASS_TO_PLAIN,
  // );

  console.log('@Service: \n', { select: select, relations: relations });
  return { select: select, relations: relations };
}
// B1: Lấy tất cả thuộc tính từ DTO kèm theo với expose relation và tên entity
// B2: Lọc chúng qua blacklist
// B3: tách thuộc tính làm hai loại relation và non-relation, đổi tên các relation
