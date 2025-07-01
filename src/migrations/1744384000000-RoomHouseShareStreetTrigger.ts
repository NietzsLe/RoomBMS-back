import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomHouseShareStreetTrigger1744384000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION share_street_for_related_rooms()
      RETURNS TRIGGER AS $$
      BEGIN
        IF OLD."streetID" IS DISTINCT FROM NEW."streetID" THEN
          UPDATE room
          SET "streetID" = NEW."streetID"
          WHERE "houseID" = NEW."houseID";
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trigger_share_street_for_related_rooms
      AFTER UPDATE ON house
      FOR EACH ROW
      EXECUTE FUNCTION share_street_for_related_rooms();
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_street_from_related_house()
      RETURNS TRIGGER AS $$
      BEGIN
        SELECT house."streetID"
        INTO NEW."streetID"
        FROM house
        WHERE "houseID" = NEW."houseID";
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE OR REPLACE TRIGGER trigger_get_street_from_related_house
      BEFORE INSERT ON room
      FOR EACH ROW
      EXECUTE FUNCTION get_street_from_related_house();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_share_street_for_related_rooms ON house;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS share_street_for_related_rooms;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_get_street_from_related_house ON room;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_street_from_related_house;`,
    );
  }
}
