package com.fingraph.FinGraph.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/protected")
    public String getProtected() {
        return "This is a protected endpoint accessible by any authenticated user.";
    }

    @GetMapping("/admin/data")
    public String getAdminData() {
        return "This is admin data accessible only by ROLE_ADMIN.";
    }
}
