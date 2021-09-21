package com.chylb.model.athlete;

import com.chylb.model.activity.Activity;
import com.chylb.model.activity.ActivityRepository;
import com.chylb.model.activity.ActivityService;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import com.chylb.model.distance.DistanceService;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.chylb.model.effort.EffortService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/athlete")
public class AthleteController {
    private final DistanceService distanceService;
    private final EffortService effortService;
    private final AthleteService athleteService;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    AthleteController(DistanceService distanceService, EffortService effortService, AthleteService athleteService, ActivityService activityService, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.distanceService = distanceService;
        this.effortService = effortService;
        this.athleteService = athleteService;
        this.activityService = activityService;
    }

    @GetMapping()
    public Athlete getAthlete() {
        return athleteService.getAthlete();
    }

    @GetMapping("/summary")
    public ResponseEntity getAthleteSummary() throws JsonProcessingException {
        List<Distance> distances = distanceService.getDistances();

        List<Activity> activities = activityService.getActivities().stream()
                .filter(e -> !e.isFlagged()).collect(Collectors.toList());

        List<Effort> efforts = effortService.getEfforts().stream()
                .filter(e -> !e.isFlagged()).collect(Collectors.toList());

        int bestPace = 0;
        if (distances.size() > 0)
            if (distances.get(0).getBestEffort() != null)
                bestPace = (int) ((int) Math.ceil(distances.get(0).getBestEffort().getTime()) / distances.get(0).getLength() * 1000);

        ObjectNode summary = objectMapper.createObjectNode();
        summary.put("distances", distances.size());
        summary.put("activities", activities.size());
        summary.put("efforts", efforts.size());
        summary.put("bestPace", bestPace);

        return ResponseEntity.ok(objectMapper.writeValueAsString(summary));
    }

    @PostMapping("/recalculateStatistics")
    public void recalculateStatistics() {
        athleteService.recalculateStatistics();
    }

    @DeleteMapping
    public void deleteAccount() {
        athleteService.deleteAthlete();
    }
}

