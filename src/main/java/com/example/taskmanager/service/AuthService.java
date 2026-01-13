package com.example.taskmanager.service;

import com.example.taskmanager.config.filter.JwtService;
import com.example.taskmanager.dto.LoginDTO;
import com.example.taskmanager.dto.TokenDTO;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.repo.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public record AuthService(
        @Lazy AuthenticationManager authenticationManager,
        UserRepository userRepository,
        JwtService jwtService
) {

    public ResponseEntity<TokenDTO> login(LoginDTO loginDTO) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDTO.getUsername(),
                        loginDTO.getPassword()
                ));

        User user = (User) authentication.getPrincipal();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        TokenDTO tokenDTO = TokenDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        return ResponseEntity.ok(tokenDTO);
    }
}
