package com.chylb.model.effort;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import com.chylb.model.distance.DistanceService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

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

    public List<Effort> getEfforts() {
        return effortRepository.getEffortsByAthleteId(athleteId());
    }

    public List<Effort> getEfforts(Activity activity) {
        return effortRepository.getEffortsByActivityId(activity.getId());
    }

    public List<Effort> getUnflaggedEfforts(Distance distance) {
        return effortRepository.getEffortsByDistanceId(distance.getId()).stream()
                .filter(x -> !x.isFlagged())
                .collect(Collectors.toList());
    }

    @Transactional
    public void generateEfforts(Activity activity) {
        activity.loadActivityStream();
        List<Distance> distances = distanceRepository.getDistancesByAthleteId(activity.getAthlete().getId());
        for (Distance distance : distances) {
            Effort effort = Effort.calculateEffort(activity, distance);
            if (effort == null)
                continue;

            List<Effort> effortRanking = getUnflaggedEfforts(distance);
            effortRanking.sort(Comparator.comparing(Effort::getTime));
            effortRanking.removeIf(e -> e.getActivity().getDate().after(activity.getDate()));

            if (!activity.isFlagged()) {
                effort.setOrdinal(effortRanking.size());
                int rank = addEffortToRanking(effortRanking, effort);
                effort.setRank(rank);
            }

            effortRepository.save(effort);
        }
    }

    @Transactional
    public void generateEfforts(Distance distance) {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(distance.getAthlete().getId());
        activities.sort(Comparator.comparing(Activity::getDate));

        int ordinal = 0;
        List<Effort> effortRanking = new LinkedList<>();

        for (Activity activity : activities) {
            activity.loadActivityStream();
            Effort effort = Effort.calculateEffort(activity, distance);
            if (effort == null)
                continue;

            if (!activity.isFlagged()) {
                effort.setOrdinal(ordinal++);
                int rank = addEffortToRanking(effortRanking, effort);
                effort.setRank(rank);
            }

            effortRepository.save(effort);
        }

        if (effortRanking.size() > 0)
            distance.setBestEffort(effortRanking.get(0));
        distance.setEffortCount(effortRanking.size());
    }

    @Transactional
    public void deleteEfforts(Activity activity) {
        for (Effort effort : effortRepository.getEffortsByActivityId(activity.getId())) {
            effortRepository.delete(effort);
        }
    }

    @Transactional
    public void deleteEfforts(Distance distance) {
        List<Effort> efforts = effortRepository.getEffortsByDistanceId(distance.getId());
        for (Effort e : efforts)
            effortRepository.delete(e);
    }

    private int addEffortToRanking(List<Effort> ranking, Effort e) {
        int ix = 0;
        while (ix < ranking.size() && ranking.get(ix).getTime() < e.getTime())
            ix++;

        ranking.add(ix, e);
        return ix;
    }

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
