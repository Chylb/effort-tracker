package com.chylb.model.athlete;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityService;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceService;
import com.chylb.model.effort.EffortService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class AthleteService {
    private final AthleteRepository athleteRepository;
    private final ActivityService activityService;
    private final DistanceService distanceService;
    private final EffortService effortService;

    public AthleteService(AthleteRepository athleteRepository, ActivityService activityService, DistanceService distanceService, EffortService effortService) {
        this.athleteRepository = athleteRepository;
        this.activityService = activityService;
        this.distanceService = distanceService;
        this.effortService = effortService;
    }

    Athlete getAthlete() {
        return athleteRepository.getAthleteById(athleteId());
    }

    @Transactional
    void recalculateStatistics() {
        for (Distance distance : distanceService.getDistances()) {
            distance.setBestEffort(null);
            effortService.deleteEfforts(distance);
            effortService.generateEfforts(distance);
        }
    }

    @Transactional
    void deleteAthlete() {
        for (Distance distance : distanceService.getDistances()) {
            distanceService.deleteDistance(distance);
        }

        for (Activity activity : activityService.getActivities()) {
            activityService.deleteActivity(activity);
        }

        athleteRepository.delete(athleteRepository.getAthleteById(athleteId()));
        SecurityContextHolder.clearContext();
    }

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
