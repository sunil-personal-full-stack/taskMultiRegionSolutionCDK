import { Item } from "dynamoose/dist/Item";
import { STATUS } from './status';

export class Task extends Item {
    id: string;
    title: string;
    description?: string;
    dateCreated: Date;
    dateAssigned?: Date;
    dateCompleted?: Date;
    dateClosed?: Date;
    status: STATUS;
    assignedTo?: string;
}