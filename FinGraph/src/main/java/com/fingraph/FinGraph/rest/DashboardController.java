package com.fingraph.FinGraph.rest;

import com.fingraph.FinGraph.dto.DashboardResponseDTO;
import com.fingraph.FinGraph.entity.User;
import com.fingraph.FinGraph.service.DashboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> getDashboard() {
        log.info("Entering DashboardController.getDashboard");
        try {
            User user = getAuthenticatedUser();
            DashboardResponseDTO dashboardData = dashboardService.getDashboardData(user);
            log.info("Exiting DashboardController.getDashboard successfully for user: {}", user.getUsername());
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            log.error("Error in DashboardController.getDashboard: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to retrieve dashboard data."));
        }
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new AccessDeniedException("Invalid user principal");
    }
}
