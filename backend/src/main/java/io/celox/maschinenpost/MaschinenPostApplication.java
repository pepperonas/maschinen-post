package io.celox.maschinenpost;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MaschinenPostApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaschinenPostApplication.class, args);
    }
}
