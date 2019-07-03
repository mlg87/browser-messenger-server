import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation, User } from '.';
import Base from './Base';

@Entity()
export default class Message extends Base {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Conversation)
    conversation: Conversation;

    @ManyToOne(() => User)
    from: User;

    @ManyToOne(() => User)
    to: User;

    @Column()
    message: string;

}
