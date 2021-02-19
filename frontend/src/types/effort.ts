import { Activity } from "./activity";
import { Distance } from "./distance";

export interface Effort {
    id: number;
    activity: Activity;
    distance: Distance;
    time: number;
    ordinal: number;
    rank: number;
}