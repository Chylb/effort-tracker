import { Effort } from "./effort";

export interface Distance {
    id: number;
    name: string;
    length: number;
    bestEffort: Effort;
    effortCount: number;
}