package com.chylb.webhook;

import com.chylb.model.activity.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.web.bind.annotation.*;

@RestController
public class WebhookController {
    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);

    private final OAuth2AuthorizedClientService clientService;
    private final ActivityService activityService;
    private final ObjectMapper objectMapper;

    @Lazy
    public WebhookController(OAuth2AuthorizedClientService clientService, ActivityService activityService, ObjectMapper objectMapper) {
        this.clientService = clientService;
        this.activityService = activityService;
        this.objectMapper = objectMapper;
    }

    @GetMapping(path = "/callback")
    ObjectNode validation(@RequestParam("hub.challenge") String challenge) {
        logger.info("Callback challenge");
        ObjectNode object = objectMapper.createObjectNode();
        object.put("hub.challenge", challenge);
        return object;
    }

    @PostMapping(path = "/callback")
    void event(@RequestBody ObjectNode body) {
        logger.info("Callback event");

        String aspectType = body.get("aspect_type").asText();
        String ownerId = body.get("owner_id").asText();
        String objectType = body.get("object_type").asText();
        String objectId = body.get("object_id").asText();
        String subscriptionId = body.get("subscription_id").asText();
        String envSubscriptionId = System.getenv("WEBHOOK_SUBSCRIPTION_ID");

        if(aspectType.equals("create") && objectType.equals("activity") &&
                subscriptionId.equals(envSubscriptionId)) {
            OAuth2AuthorizedClient client = clientService.loadAuthorizedClient("strava", ownerId);

            activityService.addActivityIfDoesntExist(Long.parseLong(objectId), () -> {
                ActivityService.CompleteActivity ca = activityService.fetchActivity(objectId, ownerId);
                activityService.addActivityAndDescription(client, ca);
                return null;
            });
        }
    }
}

