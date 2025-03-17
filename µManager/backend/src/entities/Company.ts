import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Client } from './Client';
import { Invoice } from './Invoice';
import { Contract } from './Contract';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  companyId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 50 })
  city: string;

  @Column({ type: 'varchar', length: 7 })
  postalCode: string;

  @Column({ type: "varchar", length: 10, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  rib: string;

  @Column({ type: "varchar", length: 14, nullable: true })
  siret: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.companies, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Client, (client) => client.company)
  clients: Client[];

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];

  @OneToMany(() => Contract, (contract) => contract.company)
  contracts: Contract[];
}