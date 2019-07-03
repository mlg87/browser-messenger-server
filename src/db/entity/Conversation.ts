import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Base from './Base';
import { User } from './index';

@Entity()
export default class Conversation extends Base {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user1: User;

    @ManyToOne(() => User)
    user2: User;

}
