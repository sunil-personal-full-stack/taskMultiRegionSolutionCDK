import { Stack, StackProps } from "aws-cdk-lib";
import { REGION } from './../customTypes/region';
import { CreateTableProps } from './../customTypes/createTableProps';
import { AttributeType, BillingMode, ProjectionType, Table } from "aws-cdk-lib/aws-dynamodb";

export function createTable(stack : Stack, { tableName, replicationRegions, region }: CreateTableProps, MAIN_REGION: REGION) {
    // IN CASE OF MAIN REGION ONLY WE WILL CREATE TABLES, OTHERWISE JUST GET THE NAME
    if (region === MAIN_REGION) {
        const table = new Table(stack, "Table", {
            tableName,
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            sortKey: {
                name: "dateCreated",
                type: AttributeType.STRING
            },
            
            replicationRegions,
        });

        table.addGlobalSecondaryIndex({
            indexName: "assignedToIndex",
            partitionKey: {
                name: "assignedTo",
                type: AttributeType.STRING
            },
            projectionType: ProjectionType.ALL
        });

        return table
    } else {
        return Table.fromTableName(stack, "Table", tableName);
    }
}

export function getTableSuffix(): string {
    if (process.env.TABLE_SUFFIX) {
        return `-${process.env.TABLE_SUFFIX}`;
    } else {
        return "";
    }
}