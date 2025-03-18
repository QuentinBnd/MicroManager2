import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("conversations")
export class Conversation {
    @PrimaryGeneratedColumn()
    conversationId: number;

    // Spécifier le type exact pour correspondre à celui dans la table users
    @Column({ type: "bigint", unsigned: true, nullable: false })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @Column({ type: "json", nullable: true })
    messages: Array<{role: string, content: string}>;

    @Column({ default: 'Conversation avec assistant' })
    title: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}