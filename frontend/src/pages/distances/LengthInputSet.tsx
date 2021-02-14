import React, { useState } from "react";
import { LengthUnit } from "../../types/lengthUnit";
import { LengthInput } from "./LengthInput";

const mile2meter = (mile: number): number => {
    return 1609.344 * mile;
}

const yard2meter = (yard: number): number => {
    return 0.9144 * yard;
}

const meter2mile = (meter: number): number => {
    return meter * 0.000621371192;
}

const meter2yard = (meter: number): number => {
    return meter * 1.093613;
}

export const LengthInputSet: React.FC = () => {
    const [length, setLength] = useState<string>('');
    const [unit, setUnit] = useState<LengthUnit>('meters');
    const [metricLength, setMetricLength] = useState<number>(0);

    const handleMeterChange = (length: string) => {
        setUnit('meters');
        setLength(length);
        setMetricLength(parseFloat(length));
    }

    const handleMileChange = (length: string) => {
        setUnit('miles');
        setLength(length);
        setMetricLength(mile2meter(parseFloat(length)));
    }

    const handleYardChange = (length: string) => {
        setUnit('yards');
        setLength(length);
        setMetricLength(yard2meter(parseFloat(length)));
    }

    const convert = (meters: number, unit: LengthUnit): string => {
        let output = "";
        if (meters === 0)
            return output;

        switch (unit) {
            case "meters":
                output = meters.toFixed(0);
                break;
            case "miles":
                output = meter2mile(meters).toFixed(3);
                break;
            case "yards":
                output = meter2yard(meters).toFixed(0);
                break;
        }
        return output;
    }

    return (
        <fieldset id="length">
            <LengthInput
                unit="meters"
                length={unit === 'meters' ? length : convert(metricLength, 'meters')}
                onLengthChange={handleMeterChange} />
            <LengthInput
                unit="miles"
                length={unit === 'miles' ? length : convert(metricLength, 'miles')}
                onLengthChange={handleMileChange} />
            <LengthInput
                unit="yards"
                length={unit === 'yards' ? length : convert(metricLength, 'yards')}
                onLengthChange={handleYardChange} />
        </fieldset>
    );

}