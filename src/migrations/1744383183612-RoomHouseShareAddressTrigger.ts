import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomHouseShareAddressTrigger1744383183612
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION share_address_for_related_rooms()
        RETURNS TRIGGER AS $$
        BEGIN
            IF OLD."provinceCode" <> NEW."provinceCode" OR
                OLD."districtCode" <> NEW."districtCode" OR
                OLD."wardCode" <> NEW."wardCode"
                THEN
                UPDATE room
                SET "provinceCode" = NEW."provinceCode",
                "districtCode" = NEW."districtCode",
                "wardCode" = NEW."wardCode"
                WHERE "houseID" = NEW."houseID";
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_share_address_for_related_rooms
        AFTER UPDATE ON house
        FOR EACH ROW
        EXECUTE FUNCTION share_address_for_related_rooms();`);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION get_address_from_related_house()
        RETURNS TRIGGER AS $$
        BEGIN
            SELECT house."provinceCode", house."districtCode", house."wardCode"
            INTO NEW."provinceCode", NEW."districtCode", NEW."wardCode"
            FROM house
            WHERE "houseID" = NEW."houseID";
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_get_address_from_related_house
        BEFORE INSERT ON room
        FOR EACH ROW
        EXECUTE FUNCTION get_address_from_related_house();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_share_address_for_related_rooms ON house;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS share_address_for_related_rooms;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_get_address_from_related_house ON room;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_address_from_related_house;`,
    );
  }
}
