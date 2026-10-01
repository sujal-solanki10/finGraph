package com.fingraph.FinGraph.service;

import com.fingraph.FinGraph.dao.UserProfileDAO;
import com.fingraph.FinGraph.dto.UserProfileDTO;
import com.fingraph.FinGraph.entity.User;
import com.fingraph.FinGraph.entity.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class UserProfileService {

    @Autowired
    private  UserProfileDAO userProfileDAO;

    public UserProfileDTO getProfile(User user) {
        log.info("Entering UserProfileService.getProfile for userId: {}", user.getUserId());
        Optional<UserProfile> profileOpt = userProfileDAO.findByUser_userId(user.getUserId());
        
        if (profileOpt.isEmpty()) {
            log.info("Exiting UserProfileService.getProfile - no profile found, returning empty DTO");
            return new UserProfileDTO(); // Return empty profile if none exists, or handle differently based on requirements
        }

        log.info("Exiting UserProfileService.getProfile - profile found");
        return mapToDTO(profileOpt.get());
    }

    public UserProfileDTO updateProfile(User user, UserProfileDTO dto) {
        log.info("Entering UserProfileService.updateProfile for userId: {}", user.getUserId());
        UserProfile profile = userProfileDAO.findByUser_userId(user.getUserId()).orElse(new UserProfile());
        
        if (profile.getUserId() == null) {
            log.info("Creating new UserProfile for userId: {}", user.getUserId());
            profile.setUser(user);
        } else {
            log.info("Updating existing UserProfile for userId: {}", user.getUserId());
        }
        
        profile.setFirstName(dto.getFirstName());
        profile.setLastName(dto.getLastName());
        profile.setPhone(dto.getPhone());
        profile.setDateOfBirth(dto.getDateOfBirth());
        profile.setBio(dto.getBio());

        UserProfile savedProfile = userProfileDAO.save(profile);
        log.info("Exiting UserProfileService.updateProfile - successfully saved profile");
        return mapToDTO(savedProfile);
    }

    private UserProfileDTO mapToDTO(UserProfile profile) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setFirstName(profile.getFirstName());
        dto.setLastName(profile.getLastName());
        dto.setPhone(profile.getPhone());
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setBio(profile.getBio());
        return dto;
    }
}
