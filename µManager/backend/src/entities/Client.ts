import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
  } from 'typeorm';
  import { Company } from './Company';
  import { Invoice } from './Invoice';
  import { Contract } from './Contract';
  
  @Entity('clients')
  export class Client {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    clientId: number;
  
    @Column({ type: 'varchar', length: 255 })
    clientRib: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    clientCompany: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    name: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    lastName: string;
  
    @Column({ type: 'varchar', length: 255 })
    email: string;
  
    @Column({ type: 'varchar', length: 255 })
    phone: string;
  
    @Column({ type: 'text' })
    address: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @ManyToOne(() => Company, (company) => company.clients, { onDelete: 'CASCADE' })
    company: Company;
  
    @OneToMany(() => Invoice, (invoice) => invoice.client)
    invoices: Invoice[];

    @OneToMany(() => Contract, (contract) => contract.client)
    contracts: Contract[];
  }