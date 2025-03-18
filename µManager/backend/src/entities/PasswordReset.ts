import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class PasswordReset {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ unique: true })
    token: string;
    
    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;
    
    @Column()
    expiresAt: Date;
    
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
}