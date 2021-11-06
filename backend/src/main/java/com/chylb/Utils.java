package com.chylb;

public class Utils {
    public static String secondsToString(int seconds) {
        int h = seconds / 3600;
        int m = (seconds - 3600 * h) / 60;
        int s = seconds - 3600 * h - 60 * m;

        if (seconds < 60) {
            if (s > 0)
                return s + "s";
            return "";
        }

        String result = String.valueOf(s);
        if (s < 10)
            result = "0" + result;

        result = m + ":" + result;

        if (h > 0) {
            if (m < 10)
                result = "0" + result;

            result = h + ":" + result;
        }
        return result;
    }
}
