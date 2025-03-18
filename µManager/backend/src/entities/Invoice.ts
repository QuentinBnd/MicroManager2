import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from './Company';
import { Client } from './Client';
import { InvoiceLine } from './InvoiceLine';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  invoiceId: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: ['Draft', 'Sent', 'Paid'], default: 'Draft' })
  status: 'Draft' | 'Sent' | 'Paid';

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @ManyToOne(() => Company, (company) => company.invoices, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => Client, (client) => client.invoices, { onDelete: 'CASCADE' })
  client: Client;

  @OneToMany(() => InvoiceLine, (line) => line.invoice, { cascade: true })
  lines: InvoiceLine[];

  @Column({ type: "timestamp", nullable: true })
  lastReminderDate: Date;
}