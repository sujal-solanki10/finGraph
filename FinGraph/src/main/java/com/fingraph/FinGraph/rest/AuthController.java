package com.fingraph.FinGraph.rest;

import com.fingraph.FinGraph.dto.LoginDTO;
import com.fingraph.FinGraph.dto.SignupDTO;
import com.fingraph.FinGraph.security.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginDTO> login(@RequestBody LoginDTO loginDTO) {
        return ResponseEntity.ok(authService.login(loginDTO));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupDTO signupDTO) {
        try {
            SignupDTO returnedDto = authService.signup(signupDTO);
            return ResponseEntity.ok(returnedDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error during signup: " + e.getMessage());
        }
    }
}
