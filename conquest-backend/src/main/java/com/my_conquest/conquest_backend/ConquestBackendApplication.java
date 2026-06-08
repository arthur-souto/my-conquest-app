package com.my_conquest.conquest_backend;

import com.my_conquest.conquest_backend.config.R2Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

@SpringBootApplication
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
@EnableConfigurationProperties(R2Properties.class)
public class ConquestBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConquestBackendApplication.class, args);
	}

}
