package com.fingraph.FinGraph.rest;

import com.fingraph.FinGraph.dto.UserProfileDTO;
import com.fingraph.FinGraph.entity.User;
import com.fingraph.FinGraph.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/profile")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        log.info("Entering UserProfileController.getProfile");
        try {
            User user = getAuthenticatedUser();
            UserProfileDTO profile = userProfileService.getProfile(user);
            log.info("Exiting UserProfileController.getProfile successfully for user: {}", user.getUsername());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error in UserProfileController.getProfile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to retrieve profile data."));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileDTO userProfileDTO) {
        log.info("Entering UserProfileController.updateProfile");
        try {
            User user = getAuthenticatedUser();
            UserProfileDTO updatedProfile = userProfileService.updateProfile(user, userProfileDTO);
            log.info("Exiting UserProfileController.updateProfile successfully for user: {}", user.getUsername());
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            log.error("Error in UserProfileController.updateProfile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to update profile. Please ensure inputs are valid."));
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
