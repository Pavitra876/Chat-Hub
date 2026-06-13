package com.library.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        String dbEnv = System.getenv("DATABASE_URL");
        if (dbEnv == null || dbEnv.isBlank()) {
            throw new IllegalStateException("DATABASE_URL environment variable is not set");
        }

        URI uri = new URI(dbEnv);
        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();
        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=disable";

        String username = null;
        String password = null;
        if (uri.getUserInfo() != null) {
            String[] info = uri.getUserInfo().split(":", 2);
            username = info[0];
            password = info.length > 1 ? info[1] : "";
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5);
        ds.setConnectionTimeout(30000);
        return ds;
    }
}
