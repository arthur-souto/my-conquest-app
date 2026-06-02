package com.my_conquest.conquest_backend.config;

import com.my_conquest.conquest_backend.entity.User;
import com.my_conquest.conquest_backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserRequestFilter extends OncePerRequestFilter {

    private final UserService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            var keyCloakId = UUID.fromString(jwt.getSubject());
            var name = jwt.getClaim("name").toString();
            var email = jwt.getClaim("email").toString();

            userService.getOrCreateUser(keyCloakId, User
                    .builder()
                    .name(name.trim())
                    .email(email.trim())
                    .keyCloakId(keyCloakId)
            );
        }

        filterChain.doFilter(request, response);
    }

}
