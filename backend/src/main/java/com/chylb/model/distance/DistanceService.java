package com.chylb.model.distance;

import com.chylb.exceptions.ForbiddenException;
import com.chylb.exceptions.NotFoundException;
import com.chylb.exceptions.UnprocessableEntityException;
import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DistanceService {
    private final DistanceRepository distanceRepository;
    private final AthleteRepository athleteRepository;
    private final ActivityRepository activityRepository;
    private final EffortRepository effortRepository;

    public DistanceService(DistanceRepository distanceRepository, AthleteRepository athleteRepository, ActivityRepository activityRepository, EffortRepository effortRepository) {
        this.distanceRepository = distanceRepository;
        this.athleteRepository = athleteRepository;
        this.activityRepository = activityRepository;
        this.effortRepository = effortRepository;
    }

    public List<Distance> getDistances() {
        return distanceRepository.getDistancesByAthleteId(athleteId());
    }

    public Distance getDistance(long id) {
        Distance distance = distanceRepository.getDistanceById(id);
        if (distance == null)
            throw new NotFoundException("Distance not found");
        if (distance.getAthlete().getId() != athleteId())
            throw new ForbiddenException("Access denied");

        return distance;
    }

    @Transactional
    public Distance addDistance(Distance newDistance) {
        if (newDistance.getLength() <= 0 || newDistance.getName().length() == 0)
            throw new UnprocessableEntityException("Bad distance");

        Athlete athlete = athleteRepository.getAthleteById(athleteId());
        String name = newDistance.getName();
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(athleteId());
        if (distances.stream().map(Distance::getName).collect(Collectors.toList()).contains(name))
            throw new UnprocessableEntityException("Name already occupied");

        newDistance.setAthlete(athlete);

        Distance savedDistance = distanceRepository.save(newDistance);
        addEfforts(savedDistance);
        return savedDistance;
    }

    @Transactional
    public void deleteDistance(Distance distance) {
        List<Effort> efforts = effortRepository.getEffortsByDistanceId(distance.getId());
        for (Effort e : efforts)
            effortRepository.delete(e);

        distanceRepository.delete(distance);
    }

    @Transactional
    public void recalculateDistancesStatistics() {
        for (Distance distance : distanceRepository.getDistancesByAthleteId(athleteId())) {
            recalculateDistanceStatistics(distance);
        }
    }

    @Transactional
    public void addActivityEfforts(Activity activity) {
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(activity.getAthlete().getId());
        for (Distance distance : distances) {
            Effort effort = activity.calculateEffort(distance);
            effortRepository.save(effort);
        }
    }

    private void recalculateDistanceStatistics(Distance distance) {
        int effortCount = 0;
        int bestTime = Integer.MAX_VALUE;
        Effort bestEffort = null;

        for (Effort effort : effortRepository.getUnflaggedEffortsByDistanceId(distance.getId())) {
            effortCount++;
            if (effort.getTime() < bestTime) {
                bestTime = effort.getTime();
                bestEffort = effort;
            }
        }

        distance.setEffortCount(effortCount);
        distance.setBestEffort(bestEffort);

        distanceRepository.save(distance);
    }

    private void addEfforts(Distance distance) {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(distance.getAthlete().getId());

        int effortCount = 0;
        int bestTime = Integer.MAX_VALUE;
        Effort bestEffort = null;

        for (Activity activity : activities) {
            activity.loadActivityStream();
            Effort effort = activity.calculateEffort(distance);
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

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
