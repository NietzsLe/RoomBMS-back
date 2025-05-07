import { MigrationInterface, QueryRunner } from 'typeorm';

export class IdTrigger1744189977026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION compute_appointment_name_from_tenant_room() 
        RETURNS TRIGGER AS $$
        DECLARE
        tenant_row tenant%ROWTYPE;
        room_row room%ROWTYPE;
        BEGIN
            NEW.name:='';
            IF NEW."tenantID" IS NOT NULL THEN
                SELECT * INTO tenant_row FROM tenant WHERE tenant."tenantID"=NEW."tenantID";
                NEW.name := 'KH: ' || tenant_row.name;
            END IF;
            
            IF NEW."tenantID" IS NOT NULL AND NEW."roomID" IS NOT NULL THEN
                NEW.name := NEW.name || ' - ';
            END IF;
            
            IF NEW."roomID" IS NOT NULL THEN
                SELECT * INTO room_row FROM room WHERE room."roomID"=NEW."roomID";
                NEW.name := NEW.name || 'Phòng: ' || room_row.name;
            END IF;
            
            IF NEW."tenantID" IS NOT NULL OR NEW."roomID" IS NOT NULL THEN
                NEW.name := NEW.name || ' - ';
            END IF;
            
            IF NEW."appointmentTime" IS NOT NULL THEN
                NEW.name := NEW.name || TO_CHAR(NEW."appointmentTime", 'DD/MM/YYYY');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION compute_deposit_agreement_name_from_tenant_room() 
        RETURNS TRIGGER AS $$
        DECLARE
        tenant_row tenant%ROWTYPE;
        room_row room%ROWTYPE;
        BEGIN
            NEW.name:='';
            IF NEW."tenantID" IS NOT NULL THEN
                SELECT * INTO tenant_row FROM tenant WHERE tenant."tenantID"=NEW."tenantID";
                NEW.name := 'KH: ' || tenant_row.name;
            END IF;
            
            IF NEW."tenantID" IS NOT NULL AND NEW."roomID" IS NOT NULL THEN
                NEW.name := NEW.name || ' - ';
            END IF;
            
            IF NEW."roomID" IS NOT NULL THEN
                SELECT * INTO room_row FROM room WHERE room."roomID"=NEW."roomID";
                NEW.name := NEW.name || 'Phòng: ' || room_row.name;
            END IF;
            
            IF NEW."tenantID" IS NOT NULL OR NEW."roomID" IS NOT NULL THEN
                NEW.name := NEW.name || ' - ';
            END IF;
            
            IF NEW."agreementDate" IS NOT NULL THEN
                NEW.name := NEW.name || TO_CHAR(NEW."agreementDate", 'DD/MM/YYYY');
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;`);

    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_compute_name_for_appointment
        BEFORE INSERT OR UPDATE ON appointment
        FOR EACH ROW
        EXECUTE FUNCTION compute_appointment_name_from_tenant_room();`);

    await queryRunner.query(`
        CREATE OR REPLACE TRIGGER trigger_compute_name_for_deposit_agreement
        BEFORE INSERT OR UPDATE ON deposit_agreement
        FOR EACH ROW
        EXECUTE FUNCTION compute_deposit_agreement_name_from_tenant_room();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_compute_name_for_deposit_agreement ON deposit_agreement;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trigger_compute_name_for_appointment ON appointment;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS compute_appointment_name_from_tenant_room;`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS compute_deposit_agreement_name_from_tenant_room;`,
    );
  }
}
