package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.LoginRequest;
import com.my_conquest.conquest_backend.dto.LoginResponse;
import com.my_conquest.conquest_backend.exception.ResourceNotFoundException;
import com.my_conquest.conquest_backend.exception.UnauthorizedException;
import com.my_conquest.conquest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TokenService tokenService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse signIn(LoginRequest req) {
        final var user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if(!passwordEncoder.matches(req.password(), user.getPassword())) {

            throw new UnauthorizedException("Usuário não autorizado.");
        }

        return tokenService.generateToken(user);
    }



}
