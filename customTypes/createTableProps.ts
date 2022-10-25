import { REGION } from './region';

export interface CreateTableProps {
    region: REGION;
    tableName: string;
    replicationRegions: string[];
}