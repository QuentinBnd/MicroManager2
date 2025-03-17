import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from 'typeorm';
  import { Company } from './Company';
  import { IsEmail, IsNotEmpty } from "class-validator";
  
  @Entity("users")
  export class User {
    @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
    userId: number;
  
    @Column({ type: "varchar", length: 255 })
    @IsNotEmpty({ message: "Name is required" })
    name: string;
  
    @Column({ type: "varchar", length: 255 })
    @IsNotEmpty({ message: "Last name is required" })
    lastName: string;
  
    @Column({ type: "varchar", length: 255, unique: true })
    @IsEmail({}, { message: "Invalid email format" })
    email: string;
  
    @Column({ type: "varchar", length: 255 })
    @IsNotEmpty({ message: "Password is required" })
    password: string;
  
    @OneToMany(() => Company, (company) => company.user)
    companies: Company[];
  }