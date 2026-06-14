package com.iseas.ise_as_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IseAsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(IseAsBackendApplication.class, args);
	}

}
