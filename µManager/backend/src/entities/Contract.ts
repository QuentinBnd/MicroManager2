import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Client } from './Client';
  import { Company } from './Company';
  
  @Entity('contracts')
  export class Contract {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    contractId: number;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'longtext', nullable: false })
    pdfUrl: string;
  
    @Column({ type: 'date', nullable: true })
    startDate: Date;
  
    @Column({ type: 'date', nullable: true })
    endDate: Date;
  
    @Column({ type: 'enum', enum: ['Active', 'Ended', 'Archived'], default: 'Active' })
    status: 'Active' | 'Ended' | 'Archived';
  
    @CreateDateColumn()
    createdAt: Date;
  
    @ManyToOne(() => Company, (company) => company.contracts, { onDelete: 'CASCADE' })
    company: Company;
  
    @ManyToOne(() => Client, (client) => client.contracts, { nullable: true, onDelete: 'SET NULL' })
    client: Client;
  }