package com.my_conquest.conquest_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport
public class ConquestBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConquestBackendApplication.class, args);
	}

}
