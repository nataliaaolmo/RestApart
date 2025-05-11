package com.eventbride.user;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventbride.config.jwt.services.UserManagementService;
import com.eventbride.dto.ReqRes;
import com.eventbride.dto.ReqRes2;

import jakarta.validation.Valid;

@CrossOrigin(origins = {"http://localhost:5173",  "http://192.168.1.132:8081", "http://10.0.2.2:8081", "http://localhost:8081", "http://localhost:19006"})
@RestController
@RequestMapping("/api/users")
public class UserManagementController {


    @Autowired
    private UserManagementService userManagementService;

    @PostMapping("/auth/register")
    public ResponseEntity<ReqRes> register(@Valid @RequestBody ReqRes reg){
        return ResponseEntity.ok(userManagementService.register(reg));
    }

    @PostMapping("/auth/register-without-account")
    public ResponseEntity<ReqRes2> registerWithoutAccount(@Valid @RequestBody ReqRes2 reg){
        return ResponseEntity.ok(userManagementService.registerStudentWithoutAccount(reg));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<ReqRes> login(@RequestBody ReqRes req){
        return ResponseEntity.ok(userManagementService.login(req));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<ReqRes> refreshToken(@RequestBody ReqRes req){
        return ResponseEntity.ok(userManagementService.refreshToken(req));
    }
    
    @GetMapping("/auth/current-user")
    public ResponseEntity<ReqRes> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(new ReqRes(401, "No autenticado"));
        }
    
        String username = authentication.getName(); 
    
        ReqRes response = userManagementService.getMyInfo(username);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
    

}
