import * as AWS from 'aws-sdk';
import * as dynamoose from 'dynamoose';

AWS.config.update({ region: process.env.region });



AWS.config.update({
    region: process.env.region
});

const TaskModel = dynamoose.model("TasksTableV7", {
    id: {
        type: String,
        hashKey: true
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
        type: String,
        required: false
    }
}, {
    create: false,
    update: false
});

export default TaskModel;