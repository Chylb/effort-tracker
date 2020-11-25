package com.chylb;

import com.chylb.model.athlete.Athlete;
import com.chylb.model.athlete.AthleteRepository;
import com.chylb.model.athlete.AthleteController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.InteractiveAuthenticationSuccessEvent;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class AuthenticationListener implements ApplicationListener<InteractiveAuthenticationSuccessEvent> {
    @Autowired
    OAuth2AuthorizedClientService clientService;
    @Autowired
    AthleteRepository athleteRepository;
    @Autowired
    AppService appService;

    @Override
    public void onApplicationEvent(InteractiveAuthenticationSuccessEvent event) {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) event.getAuthentication();
        String registrationId = token.getAuthorizedClientRegistrationId();
        OAuth2User user = token.getPrincipal();

        Map<String, Object> map = user.getAttributes();
        DefaultOAuth2User defaultUser = (DefaultOAuth2User) event.getAuthentication().getPrincipal();

        Optional<Athlete> athlete = athleteRepository.getAthleteById(Long.parseLong(defaultUser.getName()));
        if (athlete.isEmpty()) {

            Athlete newAthlete = new Athlete();
            newAthlete.setId(Long.parseLong(defaultUser.getName()));
            newAthlete.setName(map.get("firstname").toString() + " " + map.get("lastname").toString());
            newAthlete.setProfilePicture(map.get("profile").toString());
            newAthlete.setLastActivitySync(0);
            athleteRepository.save(newAthlete);
        }

        OAuth2AuthorizedClient client = clientService.loadAuthorizedClient(registrationId, defaultUser.getName());
        appService.refreshActivities(client);
    }
}

