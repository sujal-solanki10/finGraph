package com.fingraph.FinGraph.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SignupDTO {
    private Long userId;
    private String username;
    private String password;
    private String email;
}
