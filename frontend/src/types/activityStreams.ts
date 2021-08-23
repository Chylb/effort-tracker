export interface ActivityStreams {
    distance: Stream<number>;
    time: Stream<number>;
    altitude: Stream<number>;
    latlng: Stream<[number, number]>;
}

interface Stream<Type> {
    data: Type[];
    original_size: number;
}