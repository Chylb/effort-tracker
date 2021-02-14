export const secondsToString = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds - 3600 * h) / 60);
    const s = Math.ceil(seconds - 3600 * h - 60 * m);

    if (seconds < 60) {
        if (s > 0)
            return s + "s";
        return "";
    }

    let res: string = s.toString();
    if (s < 10)
        res = "0" + res;

    res = m + ":" + res;

    if (h > 0) {
        if (m < 10)
            res = "0" + res;

        res = h + ":" + res;
    }
    return res;
}