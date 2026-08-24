package com.unihub.app.security;

import com.unihub.app.entities.authentication.AuthProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class OAuth2ProviderUserInfoExtractor {

    private final OAuth2AuthorizedClientService authorizedClientService;

    private final RestClient restClient = RestClient.create();

    public OAuth2ProviderUserInfo extract(AuthProvider provider, OAuth2AuthenticationToken token) {
        Map<String, Object> attributes = token.getPrincipal().getAttributes();

        return switch (provider) {
            case GOOGLE -> extractDefault(attributes);
            case GITHUB -> extractGitHub(token, attributes);
            default -> extractDefault(attributes);
        };
    }

    private OAuth2ProviderUserInfo extractGitHub(
            OAuth2AuthenticationToken token,
            Map<String, Object> attributes
    ) {
        return new OAuth2ProviderUserInfo(
                Objects.toString(attributes.get("id"), null),
                extractGitHubEmail(token, attributes)
        );
    }

    private OAuth2ProviderUserInfo extractDefault(Map<String, Object> attributes) {
        return new OAuth2ProviderUserInfo(
                Objects.toString(attributes.get("sub"), null),
                Objects.toString(attributes.get("email"), null)
        );
    }

    private String extractGitHubEmail(
            OAuth2AuthenticationToken token,
            Map<String, Object> attributes
    ) {
        String emailFromAttributes = Objects.toString(attributes.get("email"), null);

        if (emailFromAttributes != null && !emailFromAttributes.isBlank()) {
            return emailFromAttributes;
        }

        var authorizedClient = authorizedClientService.loadAuthorizedClient(
                token.getAuthorizedClientRegistrationId(),
                token.getName()
        );

        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            return null;
        }

        List<Map<String, Object>> emails = restClient.get()
                .uri("https://api.github.com/user/emails")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + authorizedClient.getAccessToken().getTokenValue())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

        if (emails == null || emails.isEmpty()) {
            return null;
        }

        return emails.stream()
                .filter(email -> Boolean.TRUE.equals(email.get("primary")))
                .filter(email -> Boolean.TRUE.equals(email.get("verified")))
                .map(email -> Objects.toString(email.get("email"), null))
                .filter(email -> email != null && !email.isBlank())
                .findFirst()
                .orElseGet(() -> emails.stream()
                        .filter(email -> Boolean.TRUE.equals(email.get("verified")))
                        .map(email -> Objects.toString(email.get("email"), null))
                        .filter(email -> email != null && !email.isBlank())
                        .findFirst()
                        .orElse(null));
    }
}
