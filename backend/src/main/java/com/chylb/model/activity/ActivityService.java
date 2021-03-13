package com.chylb.model.activity;

import com.chylb.ApiRequester;
import com.chylb.exceptions.ForbiddenException;
import com.chylb.exceptions.NotFoundException;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceService;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import javax.transaction.Transactional;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;

@Service
public class ActivityService {
    private final DistanceService distanceService;
    private final ActivityRepository activityRepository;
    private final AthleteRepository athleteRepository;
    private final EffortService effortService;
    private final ApiRequester apiRequester;
    private final ObjectMapper objectMapper;

    public ActivityService(DistanceService distanceService, ActivityRepository activityRepository, AthleteRepository athleteRepository, EffortService effortService, ApiRequester apiRequester, ObjectMapper objectMapper) {
        this.distanceService = distanceService;
        this.activityRepository = activityRepository;
        this.athleteRepository = athleteRepository;
        this.effortService = effortService;
        this.apiRequester = apiRequester;
        this.objectMapper = objectMapper;
    }

    public List<Activity> getActivities() {
        return activityRepository.getActivitiesByAthleteId(athleteId());
    }

    public Activity getActivity(long id) {
        Activity activity = activityRepository.getActivityById(id);
        if (activity == null)
            throw new NotFoundException("Activity not found");
        if (activity.getAthlete().getId() != athleteId())
            throw new ForbiddenException("Access denied");

        return activity;
    }

    @Transactional
    public void setFlagged(Activity activity, boolean flag) {
        if (activity.isFlagged() == flag)
            return;

        activity.setFlagged(flag);
        activityRepository.save(activity);

        if(!flag) {
            activity.loadActivityStream();
            effortService.generateEfforts(activity);
        }
        else
            effortService.deleteEfforts(activity);

        distanceService.recalculateDistancesStatistics();
    }

    @Transactional
    public void activitySync(OAuth2AuthorizedClient client) throws InterruptedException, JsonProcessingException {
        Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(client.getPrincipalName()));

        long syncTime = Instant.now().getEpochSecond();

        List<Activity> newActivities = new LinkedList<>();
        List<JsonNode> jsons;
        int page = 1;
        do {
            String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/athlete/activities")
                    .queryParam("after", athlete.getLastActivitySync())
                    .queryParam("page", page)
                    .queryParam("per_page", 200)
                    .toUriString();

            ResponseEntity<String> response = apiRequester.sendGetRequest(client, uri);
            String body = response.getBody();

            jsons = objectMapper.readValue(body, new TypeReference<List<JsonNode>>() {
            });

            for (JsonNode json : jsons) {
                Activity activity = Activity.fromJson(json);
                if (activity.getType().equals("Run") && !activity.isManual()) {
                    activity.setAthlete(athlete);
                    newActivities.add(activity);
                }
            }
            page++;
        }
        while (jsons.size() == 200);

        for (Activity activity : newActivities) {
            String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activity.getId() + "/streams")
                    .queryParam("keys", "time,distance")
                    .queryParam("key_by_type", true)
                    .toUriString();

            ResponseEntity<String> response = apiRequester.sendGetRequest(client, uri);
            activity.setActivityStreamJson(response.getBody().getBytes());

            //Thread.sleep(9500);
            Thread.sleep(100);
        }

        for (Activity activity : newActivities) {
            addActivity(activity);
        }

        athlete.setLastActivitySync(syncTime);
        athleteRepository.save(athlete);
        System.out.println("Ended activity syncing");
    }

    private void addActivity(Activity activity) {
        activityRepository.save(activity);
        effortService.generateEfforts(activity);
    }

    void addGeneratedActivity(Activity activity) {
        Athlete athlete = athleteRepository.getAthleteById( athleteId());
        activity.setAthlete( athlete);
        int id = 0;
        while(activityRepository.getActivityById(id) != null)
            id++;
        activity.setId(id);
        activity.setName("generated activity " + id);

        addActivity(activity);
    }

    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }
}
