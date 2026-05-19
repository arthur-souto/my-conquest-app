package com.my_conquest.conquest_backend.service;

import com.my_conquest.conquest_backend.dto.LoginResponse;
import com.my_conquest.conquest_backend.entity.Permission;
import com.my_conquest.conquest_backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TokenService {

    @Value("${jwt.issuer}")
    private String issuer;

    private final JwtEncoder jwtEncoder;
    private static final Integer TOKEN_HOURS_EXPIRATION = 24;

    public LoginResponse generateToken(User user) {
        final var token = buildToken(user);
        final var tokenAsString = encodeToken(token);

        return new LoginResponse(
                tokenAsString,
                TOKEN_HOURS_EXPIRATION
        );
    }

    private String encodeToken(JwtClaimsSet token) {
        return jwtEncoder.encode(JwtEncoderParameters.from(token)).getTokenValue();
    }

    private JwtClaimsSet buildToken(User user) {
        final var now = Instant.now();

        return JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(now.plus(TOKEN_HOURS_EXPIRATION, ChronoUnit.HOURS))
                .claim("roles", user.getPermissions().stream().map(Permission::getName).toList())
                .build();
    }


}
