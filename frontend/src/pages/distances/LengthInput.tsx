import { LengthUnit } from "../../types/lengthUnit";

interface Props {
    length: string;
    unit: LengthUnit;
    onLengthChange: (v: string) => void;
}

export const LengthInput: React.FC<Props> = props => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onLengthChange(e.target.value);
    }

    return (
        <>
            <legend>Distance in {props.unit}:</legend>
            <input type="number" step="any" className="form-control" placeholder="Length" required={true}
                value={props.length}
                onChange={handleChange} />
        </>
    );
}