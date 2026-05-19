package com.justinlemmons.imagemanagerservice;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;

@SpringBootApplication
public class ImageManagerServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImageManagerServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner debug(MongoDatabaseFactory factory) {
		return args -> {
			System.out.println("🔥 REAL MONGO DB = " + factory.getMongoDatabase().getName());
		};
	}

}
