import { Effort } from "./efforts";

export interface Distance {
    id: number;
    name: string;
    length: number;
    bestEffort: Effort;
    effortCount: number;
}