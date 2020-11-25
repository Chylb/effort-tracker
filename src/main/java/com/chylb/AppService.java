package com.chylb;

import com.chylb.model.activity.*;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.distance.Distance;
import com.chylb.model.distance.DistanceRepository;
import com.chylb.model.effort.Effort;
import com.chylb.model.effort.EffortRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.util.LinkedList;
import java.util.List;
import java.util.zip.InflaterOutputStream;

@Service
public class AppService {
    @Autowired
    AthleteRepository athleteRepository;
    @Autowired
    DistanceRepository distanceRepository;
    @Autowired
    ActivityRepository activityRepository;
    @Autowired
    ActivityStreamRepository activityStreamRepository;
    @Autowired
    EffortRepository effortRepository;
    @Autowired
    ApiRequester apiRequester;
    @Autowired
    ObjectMapper objectMapper;

    public void loadActivityStream(Activity activity) {
        ActivityStream activityStream = activityStreamRepository.getActivityStreamById(activity.getId()).get();
        byte[] compressed = activityStream.getCompressedActivityStream();

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            InflaterOutputStream infl = new InflaterOutputStream(out);
            infl.write(compressed);
            infl.flush();
            infl.close();

            byte[] uncompressed = out.toByteArray();

            ActivityStreamData data = objectMapper.readValue(uncompressed, ActivityStreamData.class);
            activity.setStreamTime(data.time.data);
            activity.setStreamDistance(data.distance.data);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public Distance addDistance(Distance distance) {
        Distance savedDistance = distanceRepository.save(distance);
        addEfforts(distance.getAthlete(), savedDistance);
        return savedDistance;
    }

    public void deleteDistance(Distance distance) {
        List<Effort> efforts = effortRepository.getEffortsByDistanceId(distance.getId());
        for (Effort e : efforts)
            effortRepository.delete(e);
        distanceRepository.delete(distance);
    }

    public void addEfforts(Athlete athlete, Distance distance) {
        List<Activity> activities = activityRepository.getActivitiesByAthleteId(athlete.getId());

        for (Activity activity : activities) {
            loadActivityStream(activity);
            Effort effort = activity.calculateEffort(distance);
            if (effort == null)
                continue;

            int effortCount = distance.getEffortCount();
            if (effortCount == 0) {
                distance.setEffortCount(1);
                distance.setBestTime(effort.getTime());
            } else {
                distance.setEffortCount(effortCount + 1);
                int bestTime = distance.getBestTime();
                if (effort.getTime() < bestTime)
                    distance.setBestTime(effort.getTime());
            }
            effortRepository.save(effort);
        }
    }

    public void refreshActivities(OAuth2AuthorizedClient client) {
        new Thread(() -> {
            try {
                Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(client.getPrincipalName())).get();

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

                List<Distance> distances = distanceRepository.getDistancesByAthleteId(athlete.getId());

                for (Activity activity : newActivities) {
                    String uri = UriComponentsBuilder.newInstance().scheme("https").host("www.strava.com").path("/api/v3/activities/" + activity.getId() + "/streams")
                            .queryParam("keys", "time,distance")
                            .queryParam("key_by_type", true)
                            .toUriString();

                    ResponseEntity<String> response = apiRequester.sendGetRequest(client, uri);
                    String body = response.getBody();
                    ActivityStream stream = ActivityStream.fromJson(body);
                    stream.setId(activity.getId());

                    activityRepository.save(activity);
                    activityStreamRepository.save(stream);

                    loadActivityStream(activity);
                    for (Distance distance : distances) {
                        Effort effort = activity.calculateEffort(distance);
                        effortRepository.save(effort);
                    }

                    //Thread.sleep(9500);
                    Thread.sleep(500);
                }
                athlete.setLastActivitySync(syncTime);
                athleteRepository.save(athlete);
                System.out.println("Ended activity syncing");

            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        }).start();
    }

    @Setter //@formatter:off
    private static class ActivityStreamData{
        @Setter static class Time{ List<Integer> data;}
        @Setter static class Distance{ List<Float> data;}
        Time time;
        Distance distance;
    } //@formatter:on
}
