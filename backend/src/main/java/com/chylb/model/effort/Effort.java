package com.chylb.model.effort;

import com.chylb.model.activity.Activity;
import com.chylb.model.distance.Distance;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import java.util.Iterator;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Effort {
    @Id
    @GeneratedValue
    private long id;

    @ManyToOne
    private Activity activity;

    private int ix0;
    private int ix1;

    @JsonIgnoreProperties("bestEffort")
    @ManyToOne
    private Distance distance;

    private int time;

    private int ordinal;

    private int rank;

    public static Effort calculateEffort(Activity activity, Distance distance) {
        if (distance.getLength() > activity.getDistance())
            return null;

        List<Integer> streamTime = activity.getStreamTime();
        List<Float> streamDistance = activity.getStreamDistance();

        int ix0 = 0;
        int ix1 = 0;
        int size = streamTime.size();

        float d0 = streamDistance.get(ix0);
        float d1 = streamDistance.get(ix1);
        int t0 = streamTime.get(ix0);
        int t1 = streamTime.get(ix1);

        int time;
        int bestTime = Integer.MAX_VALUE;
        int bestIx0 = 0, bestIx1 = 0;

        while (ix1 < size - 1) {
            while (ix1 < size - 1 && d1 - d0 < distance.getLength()) {
                ix1++;
                d1 = streamDistance.get(ix1);
                t1 = streamTime.get(ix1);
            }

            if (d1 - d0 < distance.getLength())
                break;

            time = t1 - t0;
            if (time < bestTime) {
                bestTime = time;
                bestIx0 = ix0;
                bestIx1 = ix1;
            }

            ix0++;
            d0 = streamDistance.get(ix0);
            t0 = streamTime.get(ix0);
        }

        if (bestTime == Integer.MAX_VALUE)
            bestTime = streamTime.get(streamTime.size() - 1);

        Effort effort = new Effort();
        effort.setDistance(distance);
        effort.setActivity(activity);
        effort.setTime(bestTime);
        effort.setIx0(bestIx0);
        effort.setIx1(bestIx1);

        return effort;
    }
}
