export const prMedal = (rank: number) => {
    if (rank == 0 || rank == 1 || rank == 2) {
        const style = {
            backgroundImage: `url("${process.env.PUBLIC_URL}/pr/${rank + 1}.svg")`,
            height: "24px",
            width: "24px"
        }
        return <div style={style} />
    }
    return <div />;
};

export const prDescription = (rank: number) => {
    switch (rank) {
        case 0:
            return "Personal record"
        case 1:
            return "2nd fastest time"
        case 2:
            return "3rd fastest time"
        default:
            return "";
    }
}