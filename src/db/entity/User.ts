import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    Unique
} from 'typeorm';
import Base from './Base';

@Entity()
@Unique(['username'])
export default class User extends Base {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ length: 60, type: 'char' })
    password: string;

    @Column({ default: false })
    isOnline: boolean;

}
