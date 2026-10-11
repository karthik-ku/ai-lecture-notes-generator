package com.ailecturenotes.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:h2:mem:ailecturedb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL}")
    private String rawUrl;

    @Value("${spring.datasource.username:sa}")
    private String rawUsername;

    @Value("${spring.datasource.password:}")
    private String rawPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        String jdbcUrl = rawUrl != null ? rawUrl.trim() : "";
        String dbUser = rawUsername != null ? rawUsername.trim() : "";
        String dbPass = rawPassword != null ? rawPassword.trim() : "";

        // Check if Render-style PostgreSQL URL (postgres:// or postgresql:// without jdbc:)
        if (jdbcUrl.startsWith("postgres://") || jdbcUrl.startsWith("postgresql://")) {
            try {
                // Ensure URI parses scheme properly
                String uriString = jdbcUrl.startsWith("postgres://") 
                        ? "http://" + jdbcUrl.substring("postgres://".length()) 
                        : "http://" + jdbcUrl.substring("postgresql://".length());
                URI uri = URI.create(uriString);

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath() != null && uri.getPath().startsWith("/") 
                        ? uri.getPath().substring(1) 
                        : uri.getPath();

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":");
                    dbUser = userParts[0];
                    if (userParts.length > 1) {
                        dbPass = userParts[1];
                    }
                }

                String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + path + query;
                config.setDriverClassName("org.postgresql.Driver");
                log.info("Converted Render-style PostgreSQL URL to standard JDBC: jdbc:postgresql://{}:{}/{}", host, port, path);
            } catch (Exception e) {
                log.warn("Could not parse URI structure, falling back to basic jdbc: prefix replacement: {}", e.getMessage());
                if (jdbcUrl.startsWith("postgres://")) {
                    jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgres://".length());
                } else {
                    jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgresql://".length());
                }
                config.setDriverClassName("org.postgresql.Driver");
            }
        } else if (jdbcUrl.startsWith("jdbc:postgresql:")) {
            config.setDriverClassName("org.postgresql.Driver");
            log.info("Detected standard PostgreSQL JDBC URL");
        } else if (jdbcUrl.startsWith("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
            log.info("Using local H2 in-memory database");
        }

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(dbUser);
        config.setPassword(dbPass);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
