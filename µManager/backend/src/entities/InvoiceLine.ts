import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Invoice } from "./Invoice";

@Entity("invoice_lines")
export class InvoiceLine {
    @PrimaryGeneratedColumn()
    lineId: number;

    @Column()
    description: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    quantity: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.lines, { onDelete: "CASCADE" })
    @JoinColumn({ name: "invoiceId" }) // Clé étrangère
    invoice: Invoice;
}