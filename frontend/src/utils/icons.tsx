import { CSSProperties } from "react";

export const icon = (name: string) => {
    const style: CSSProperties = {
        backgroundImage: `url("${process.env.PUBLIC_URL}/icons/${name}.svg")`,
        height: "16px",
        width: "16px",
        display: "inline-block"
    }
    return <div style={style} />
};