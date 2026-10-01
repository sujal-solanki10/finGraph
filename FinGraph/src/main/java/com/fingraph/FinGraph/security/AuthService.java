package com.fingraph.FinGraph.security;

import com.fingraph.FinGraph.dao.UserDAO;
import com.fingraph.FinGraph.dto.LoginDTO;
import com.fingraph.FinGraph.dto.SignupDTO;
import com.fingraph.FinGraph.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuthUtil authUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserDAO userDAO;

    public LoginDTO login(LoginDTO loginDTO) {
        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));

        User user = (User) authentication.getPrincipal();
        String token = authUtil.generateAccessToken(user);
        return new LoginDTO(user.getUserId(), user.getUsername(), null, token);
    }

    public SignupDTO signup(SignupDTO signupDTO) {
        User user = userDAO.findByUsername(signupDTO.getUsername()).orElse(null);

        if(user != null) {
            throw new IllegalStateException("Username already exists: " + signupDTO.getUsername());
        }

        user = new User(
                signupDTO.getUsername(),
                signupDTO.getEmail(),
                signupDTO.getPassword() != null ? passwordEncoder.encode(signupDTO.getPassword()) : null
        );

        userDAO.save(user);

        signupDTO.setUserId(user.getUserId());
        signupDTO.setPassword(null);
        return signupDTO;
    }
}
