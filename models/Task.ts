import * as AWS from 'aws-sdk';
import * as dynamoose from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { STATUS } from '../customTypes/status';

AWS.config.update({ region: process.env.region });

class Task extends Item {
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

AWS.config.update({
    region: process.env.region
});

const TaskModel = dynamoose.model<Task>("TasksTable", {
    id: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    dateCreated: {
        type: Date,
        required: false
    },
    dateAssigned: {
        type: Date,
        required: false
    },
    dateCompleted: {
        type: Date,
        required: false
    },
    
    dateClosed: {
        type: Date,
        required: false
    },
    status: {
        type: String
    },
    assignedTo: {
        type: Date,
        required: false
    }
}, {
    create: false,
    update: false
});

export default TaskModel;