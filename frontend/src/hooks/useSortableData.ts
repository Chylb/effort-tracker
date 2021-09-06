import { useMemo, useState } from "react";

type Direction = 'ascending' | 'descending';

interface SortConfig {
    key: string,
    direction: Direction
}

export const useSortableData = <T>(items: T[], config: SortConfig): [T[], (key: string) => void, SortConfig] => {
    const [sortConfig, setSortConfig] = useState<SortConfig>(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        sortableItems.sort((a, b) => {
            let aVal = a;
            let bVal = b;
            for (let key of sortConfig.key.split(".")) {
                //@ts-ignore
                aVal = aVal[key];
            }
            for (let key of sortConfig.key.split(".")) {
                //@ts-ignore
                bVal = bVal[key];
            }

            //@ts-ignore
            if (aVal < bVal) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            //@ts-ignore
            if (aVal > bVal) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key: string) => {
        let direction: Direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }

    return [sortedItems, requestSort, sortConfig];
}