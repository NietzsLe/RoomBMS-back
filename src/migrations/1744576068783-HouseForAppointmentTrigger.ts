import { MigrationInterface, QueryRunner } from 'typeorm';

export class HouseForAppointmentTrigger1744576068783
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION compute_house_for_appointment() 
        RETURNS TRIGGER AS $$
        DECLARE
        BEGIN
            IF NEW."roomID" IS NOT NULL AND ((TG_OP = 'UPDATE' AND NEW."roomID" <> OLD."roomID") OR TG_OP = 'INSERT') THEN
                SELECT room."houseID"
                INTO NEW."houseID"
                FROM room
                WHERE "roomID" = NEW."roomID";
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_compute_house_for_appointment
        BEFORE INSERT OR UPDATE ON appointment
        FOR EACH ROW
        EXECUTE FUNCTION compute_house_for_appointment();`);
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION room_update_house_for_appointment() 
        RETURNS TRIGGER AS $$
        DECLARE
        BEGIN
            IF NEW."houseID" IS NOT NULL AND ((TG_OP = 'UPDATE' AND NEW."houseID" <> OLD."houseID") OR TG_OP = 'INSERT') THEN
                UPDATE appointment
                SET "houseID" = NEW."houseID"
                WHERE "roomID" = NEW."roomID";
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_room_update_house_for_appointment
        BEFORE INSERT OR UPDATE ON room
        FOR EACH ROW
        EXECUTE FUNCTION room_update_house_for_appointment();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_compute_house_for_appointment ON appointment;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS compute_house_for_appointment;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_room_update_house_for_appointment ON room;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS room_update_house_for_appointment;`,
    );
  }
}
