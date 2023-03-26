package com.chylb;

import com.chylb.model.activity.ActivityService;
import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuthenticationListener implements ApplicationListener<InteractiveAuthenticationSuccessEvent> {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationListener.class);

    @Lazy
    @Autowired
    OAuth2AuthorizedClientService clientService;

    @Lazy
    @Autowired
    AthleteRepository athleteRepository;
    @Lazy
    @Autowired
    ActivityService activityService;

    @Override
    public void onApplicationEvent(InteractiveAuthenticationSuccessEvent event) {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) event.getAuthentication();
        String registrationId = token.getAuthorizedClientRegistrationId();
        OAuth2User user = token.getPrincipal();

        Map<String, Object> map = user.getAttributes();
        DefaultOAuth2User defaultUser = (DefaultOAuth2User) event.getAuthentication().getPrincipal();

        Athlete athlete = athleteRepository.getAthleteById(Long.parseLong(defaultUser.getName()));
        if (athlete == null) {
            athlete = new Athlete();
            athlete.setId(Long.parseLong(defaultUser.getName()));
            athlete.setName(map.get("firstname").toString() + " " + map.get("lastname").toString());
            athlete.setProfilePicture(map.get("profile").toString());
            athlete.setLastActivitySync(0);
            athleteRepository.save(athlete);
            logger.info("Creating user {}, id: {}", athlete.getName(), athlete.getId());
        }
        logger.info("Signing in user {}, id: {}", athlete.getName(), athlete.getId());

        OAuth2AuthorizedClient client = clientService.loadAuthorizedClient(registrationId, defaultUser.getName());
        new Thread(() -> {
            try {
                activityService.activitySync(client);
            } catch (Exception e) {
                logger.error("Unexpected error during activity sync: {}", e.getMessage());
            }
        }).start();
    }
}

