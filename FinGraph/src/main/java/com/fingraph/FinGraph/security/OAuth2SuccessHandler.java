package com.fingraph.FinGraph.security;

import com.fingraph.FinGraph.dao.UserDAO;
import com.fingraph.FinGraph.entity.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserDAO userDAO;

    @Autowired
    private AuthUtil authUtil;

    @Value("${frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        String provider = token.getAuthorizedClientRegistrationId().toUpperCase();
        OAuth2User oAuth2User = token.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerSubject = extractProviderSubject(provider, attributes);
        String email = extractEmail(provider, attributes);

        // Find existing user by provider and subject
        Optional<User> userOpt = userDAO.findByAuthProviderAndProviderSubject(provider, providerSubject);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Find by email to link accounts if email exists (optional but good practice)
            // If email is missing, generate a dummy one since DB requires non-null unique username/email
            String usernameToSave = email != null && !email.isBlank() ? email : provider.toLowerCase() + "_" + providerSubject + "@fingraph.local";

            Optional<User> existingEmailUser = userDAO.findByUsername(usernameToSave);
            if (existingEmailUser.isPresent()) {
                // Link account or just use the existing one, but update provider info
                user = existingEmailUser.get();
                user.setAuthProvider(provider);
                user.setProviderSubject(providerSubject);
                userDAO.save(user);
            } else {
                // Create new user
                user = new User();
                user.setUsername(usernameToSave); // maps to 'email' column
                user.setPassword(null); // No password for OAuth users
                user.setAuthProvider(provider);
                user.setProviderSubject(providerSubject);
                user.setRole("USER");
                user.setStatus("ACTIVE");
                user = userDAO.save(user);
            }
        }

        // Generate JWT
        String jwtToken = authUtil.generateAccessToken(user);

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/oauth2/redirect?token=" + jwtToken;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String extractProviderSubject(String provider, Map<String, Object> attributes) {
        if ("GOOGLE".equalsIgnoreCase(provider)) {
            return attributes.get("sub").toString();
        } else if ("GITHUB".equalsIgnoreCase(provider)) {
            return attributes.get("id").toString();
        }
        return attributes.getOrDefault("id", UUID.randomUUID().toString()).toString();
    }

    private String extractEmail(String provider, Map<String, Object> attributes) {
        Object emailObj = attributes.get("email");
        if (emailObj != null) {
            return emailObj.toString();
        }
        if ("GITHUB".equalsIgnoreCase(provider)) {
            Object loginObj = attributes.get("login");
            if (loginObj != null) {
                return loginObj.toString() + "@github.local"; // Fallback for github
            }
        }
        return null;
    }
}
