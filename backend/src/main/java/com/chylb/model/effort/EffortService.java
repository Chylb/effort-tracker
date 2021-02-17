package com.chylb.model.effort;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EffortService {
    private final EffortRepository effortRepository;
    private final DistanceRepository distanceRepository;
    private final ActivityRepository activityRepository;

    public EffortService(EffortRepository effortRepository, DistanceRepository distanceRepository, ActivityRepository activityRepository) {
        this.effortRepository = effortRepository;
        this.distanceRepository = distanceRepository;
        this.activityRepository = activityRepository;
    }

    public void generateEfforts(Activity activity) {
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(activity.getAthlete().getId());
        for (Distance distance : distances) {
            Effort effort = Effort.calculateEffort(activity, distance);
            effortRepository.save(effort);
        }
    }

    public void generateEfforts(Distance distance) {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(distance.getAthlete().getId());

        int effortCount = 0;
        int bestTime = Integer.MAX_VALUE;
        Effort bestEffort = null;

        for (Activity activity : activities) {
            activity.loadActivityStream();
            Effort effort = Effort.calculateEffort(activity, distance);
            if (effort == null)
                continue;

            effortCount++;
            if(effort.getTime() < bestTime) {
                bestTime = effort.getTime();
                bestEffort = effort;
            }
            effortRepository.save(effort);
        }
        distance.setEffortCount(effortCount);
        distance.setBestEffort(bestEffort);
    }
}
