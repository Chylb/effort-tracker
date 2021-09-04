package com.chylb.model.distance;

import com.chylb.exceptions.ForbiddenException;
import com.chylb.exceptions.NotFoundException;
import com.chylb.exceptions.UnprocessableEntityException;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.chylb.model.effort.EffortService;
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
    private final EffortService effortService;

    public DistanceService(DistanceRepository distanceRepository, AthleteRepository athleteRepository, EffortService effortService) {
        this.distanceRepository = distanceRepository;
        this.athleteRepository = athleteRepository;
        this.effortService = effortService;
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
        effortService.generateEfforts(savedDistance);
        return savedDistance;
    }

    @Transactional
    public void deleteDistance(Distance distance) {
        effortService.deleteEfforts(distance);
        distanceRepository.delete(distance);
    }

    @Transactional
    public void recalculateDistancesStatistics() {
        for (Distance distance : distanceRepository.getDistancesByAthleteId(athleteId())) {
            recalculateDistanceStatistics(distance);
        }
    }

    private void recalculateDistanceStatistics(Distance distance) {
        int effortCount = 0;
        int bestTime = Integer.MAX_VALUE;
        Effort bestEffort = null;

        for (Effort effort : effortService.getUnflaggedEfforts(distance)) {
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

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
