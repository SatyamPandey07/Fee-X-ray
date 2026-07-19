package com.feexray.core.config;

import com.feexray.core.model.User;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket(String plan) {
        long capacity = "PRO".equalsIgnoreCase(plan) ? 100 : 20;
        Refill refill = Refill.greedy(capacity, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        User user = (User) request.getAttribute("currentUser");
        
        if (user != null && user.getOrganization() != null) {
            String orgId = user.getOrganization().getId().toString();
            String plan = user.getOrganization().getSubscriptionTier();
            
            Bucket bucket = buckets.computeIfAbsent(orgId, k -> createNewBucket(plan));
            
            if (!bucket.tryConsume(1)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Rate limit exceeded.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
