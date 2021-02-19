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

        Iterator<Integer> tIt0 = streamTime.listIterator();
        Iterator<Float> dIt0 = streamDistance.listIterator();
        Iterator<Integer> tIt = streamTime.listIterator();
        Iterator<Float> dIt = streamDistance.listIterator();

        float d0 = dIt0.next();
        float d1 = dIt.next();
        int t0 = tIt0.next();
        int t1 = tIt.next();

        int time;
        int bestTime = Integer.MAX_VALUE;

        while (dIt.hasNext()) {
            while (dIt.hasNext() && d1 - d0 < distance.getLength()) {
                d1 = dIt.next();
                t1 = tIt.next();
            }

            if (!dIt.hasNext())
                break;

            time = t1 - t0;
            if (time < bestTime)
                bestTime = time;

            d0 = dIt0.next();
            t0 = tIt0.next();
        }

        if (bestTime == Integer.MAX_VALUE)
            bestTime = streamTime.get(streamTime.size() - 1);

        Effort effort = new Effort();
        effort.setDistance(distance);
        effort.setActivity(activity);
        effort.setTime(bestTime);
        return effort;
    }
}
