import { Employee } from './employee.entity';

export class Collaborator extends Employee {
  leaderID: string; // ID của Saler (người quản lý)
}
