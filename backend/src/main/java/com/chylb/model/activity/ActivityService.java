package com.chylb.model.activity;

import com.chylb.ApiRequester;
import com.chylb.AuthenticationListener;
import com.chylb.Utils;
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
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import javax.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);

    private final OAuth2AuthorizedClientService clientService;
    private final DistanceService distanceService;
    private final ActivityRepository activityRepository;
    private final AthleteRepository athleteRepository;
    private final EffortService effortService;
    private final ApiRequester apiRequester;
    private final ObjectMapper objectMapper;

    public ActivityService(OAuth2AuthorizedClientService clientService, DistanceService distanceService, ActivityRepository activityRepository, AthleteRepository athleteRepository, EffortService effortService, ApiRequester apiRequester, ObjectMapper objectMapper) {
        this.clientService = clientService;
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

    public boolean activityExists(long id) {
        return activityRepository.getActivityById(id) != null;
    }

    public String getActivityStreams(long id) {
        Activity activity = activityRepository.getActivityById(id);
        if (activity == null)
            throw new NotFoundException("Activity not found");
        if (activity.getAthlete().getId() != athleteId())
            throw new ForbiddenException("Access denied");

        return new String(activity.getActivityStreamJson(), StandardCharsets.UTF_8);
    }

    @Transactional
    public void setFlagged(Activity activity, boolean flag) {
        if (activity.isFlagged() == flag)
            return;

        activity.setFlagged(flag);
        activityRepository.save(activity);

        distanceService.recalculateDistancesStatistics();
    }

    @Transactional
    public void activitySync(OAuth2AuthorizedClient client) throws InterruptedException, JsonProcessingException {
        long athleteId = Long.parseLong(client.getPrincipalName());
        Athlete athlete = athleteRepository.getAthleteById(athleteId);

        long syncTime = Instant.now().getEpochSecond();

        List<Activity> newActivities = new LinkedList<>();
        List<JsonNode> jsons;
        int page = 1;
        do {
            String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/athlete/activities")
                    .queryParam("after", athlete.getLastActivitySync())
                    .queryParam("page", page)
                    .queryParam("per_page", 20)
                    .toUriString();

            String response = apiRequester.sendGetRequest(client, uri);

            jsons = objectMapper.readValue(response, new TypeReference<List<JsonNode>>() {
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
        while (jsons.size() == 20);

        newActivities = newActivities.stream().
                filter(a -> !activityExists(a.getId()))
                .collect(Collectors.toList());

        for (Activity activity : newActivities) {
            String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activity.getId() + "/streams")
                    .queryParam("keys", "time,distance,latlng,altitude")
                    .queryParam("key_by_type", true)
                    .toUriString();

            String response = apiRequester.sendGetRequest(client, uri);
            activity.setActivityStreamJson(response.getBytes());

            //Thread.sleep(9500);
            Thread.sleep(100);
        }

        for (Activity activity : newActivities) {
            addActivityIfDoesntExist(activity.getId(), () -> {
                addActivity(activity);
                return null;
            });
        }
        distanceService.recalculateDistancesStatistics(athleteId);

        athlete.setLastActivitySync(syncTime);
        athleteRepository.save(athlete);
    }

    @Transactional
    public CompleteActivity fetchActivity(String activityId, String athleteId) {
        OAuth2AuthorizedClient client = clientService.loadAuthorizedClient("strava", athleteId);
        if (client == null)
            return null;

        Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(athleteId));

        String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activityId)
                .toUriString();

        String response = apiRequester.sendGetRequest(client, uri);
        try {
            JsonNode json = objectMapper.readValue(response, JsonNode.class);
            Activity activity = Activity.fromJson(json);
            if (activity.getType().equals("Run") && !activity.isManual()) {
                activity.setAthlete(athlete);
                fetchActivityStreams(client, activity);
                return new CompleteActivity(json, activity);
            }
        } catch (Exception e) {
            logger.error("Exception during fetchActivity: {}", e.getMessage());
        }
        return null;
    }

    @Transactional
    public void deleteActivity(Activity activity) {
        activityRepository.delete(activity);
    }

    @Transactional
    void addActivity(Activity activity) {
        activityRepository.save(activity);
        effortService.generateEfforts(activity);
    }

    @Transactional
    public void addActivityIfDoesntExist(long activityId, Supplier<Void> addActivityFunction) {
        if(!activityExists(activityId)) {
            addActivityFunction.get();
        }
    }

    @Transactional
    public void addActivityAndDescription(OAuth2AuthorizedClient client, CompleteActivity ca) {
        activityRepository.save(ca.activity);
        effortService.generateEfforts(ca.activity);
        List<Effort> efforts = effortService.getEfforts(ca.activity).stream()
                .filter(e -> e.getRank() < 3)
                .sorted((a, b) -> a.getRank() != b.getRank() ?
                        Integer.compare(a.getRank(), b.getRank()) :
                        Float.compare(a.getDistance().getLength(), b.getDistance().getLength()))
                .collect(Collectors.toList());

        String addedDescription = "";
        for (Effort effort : efforts) {
            addedDescription += effortDescription(effort) + "\\n";
        }
        if (addedDescription.equals(""))
            return;

        addedDescription += "-- From Effort Tracker\\n";
        String currentDescription = ca.stravaActivity.get("description").isNull() ? "" : ca.stravaActivity.get("description").asText();
        setActivityDescription(client, ca.activity, currentDescription + "\\n\\n" + addedDescription);
    }

    void addGeneratedActivity(Activity activity) {
        Athlete athlete = athleteRepository.getAthleteById(athleteId());
        activity.setAthlete(athlete);
        int id = 0;
        while (activityRepository.getActivityById(id) != null)
            id++;
        activity.setId(id);
        activity.setName("generated activity " + id);

        addActivity(activity);
        distanceService.recalculateDistancesStatistics();
    }

    private void fetchActivityStreams(OAuth2AuthorizedClient client, Activity activity) {
        String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activity.getId() + "/streams")
                .queryParam("keys", "time,distance,latlng,altitude")
                .queryParam("key_by_type", true)
                .toUriString();

        String response = apiRequester.sendGetRequest(client, uri);
        activity.setActivityStreamJson(response.getBytes());
    }

    private void setActivityDescription(OAuth2AuthorizedClient client, Activity activity, String description) {
        String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activity.getId())
                .toUriString();

        ResponseEntity<String> response = apiRequester.sendPutRequest(client, uri, "{\"description\":\"" + description + "\"}");
    }

    private String effortDescription(Effort effort) {
        String description =
                switch (effort.getRank()) {
                    case 0 -> "Best ";
                    case 1 -> "2nd best ";
                    case 2 -> "3rd best ";
                    default -> null;
                };
        if (description == null)
            return null;

        description += effort.getDistance().getName();
        description += " effort (";
        description += Utils.secondsToString(effort.getTime());
        description += ")";
        return description;
    }


    private long athleteId() {
        DefaultOAuth2User user = (DefaultOAuth2User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return Long.parseLong(user.getName());
    }

    public static class CompleteActivity {
        final JsonNode stravaActivity;
        final Activity activity;

        CompleteActivity(JsonNode stravaActivity, Activity activity) {
            this.stravaActivity = stravaActivity;
            this.activity = activity;
        }
    }
}
