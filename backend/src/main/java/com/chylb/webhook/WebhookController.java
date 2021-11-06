package com.chylb.webhook;

import com.chylb.ApiRequester;
import com.chylb.model.activity.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.AllArgsConstructor;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
public class WebhookController {
    private final OAuth2AuthorizedClientService clientService;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    @GetMapping(path = "/callback")
    ObjectNode validation(@RequestParam("hub.challenge") String challenge) {
        System.out.println("Callback challenge");
        ObjectNode object = objectMapper.createObjectNode();
        object.put("hub.challenge", challenge);
        return object;
    }

    @PostMapping(path = "/callback")
    void event(@RequestBody ObjectNode body) {
        System.out.println("Callback event");

        String aspectType = body.get("aspect_type").asText();
        String ownerId = body.get("owner_id").asText();
        String objectType = body.get("object_type").asText();
        String objectId = body.get("object_id").asText();
        String subscriptionId = body.get("subscription_id").asText();
        String envSubscriptionId = System.getenv("WEBHOOK_SUBSCRIPTION_ID");

        if(aspectType.equals("create") && objectType.equals("activity") &&
                subscriptionId.equals(envSubscriptionId)) {
            OAuth2AuthorizedClient client = clientService.loadAuthorizedClient("strava", ownerId);

            ActivityService.CompleteActivity ca = activityService.fetchActivity(objectId, ownerId);
            activityService.addActivityAndDescription(client, ca);
        }
    }
}

