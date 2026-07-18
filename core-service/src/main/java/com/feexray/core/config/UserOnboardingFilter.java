package com.feexray.core.config;

import com.feexray.core.model.Organization;
import com.feexray.core.model.User;
import com.feexray.core.model.UserRole;
import com.feexray.core.repository.OrganizationRepository;
import com.feexray.core.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserOnboardingFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            String keycloakSub = jwtAuth.getToken().getSubject();
            String email = jwtAuth.getToken().getClaimAsString("email");

            if (email == null) {
                email = jwtAuth.getToken().getClaimAsString("preferred_username");
            }
            if (email == null) {
                email = "user@" + keycloakSub + ".local";
            }

            Optional<User> userOpt = userRepository.findByKeycloakSubjectId(keycloakSub);
            User currentUser;

            if (userOpt.isEmpty()) {
                // Auto-provisioning org and user on first login
                Organization newOrg = Organization.builder()
                        .name(email + "'s Org")
                        .subscriptionTier("FREE")
                        .build();
                Organization savedOrg = organizationRepository.save(newOrg);

                User newUser = User.builder()
                        .organization(savedOrg)
                        .email(email)
                        .keycloakSubjectId(keycloakSub)
                        .role(UserRole.OWNER)
                        .build();
                currentUser = userRepository.save(newUser);
            } else {
                currentUser = userOpt.get();
            }

            // Expose the current user as a request attribute
            request.setAttribute("currentUser", currentUser);
        }

        filterChain.doFilter(request, response);
    }
}
