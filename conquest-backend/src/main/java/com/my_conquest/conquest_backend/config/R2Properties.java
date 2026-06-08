package com.my_conquest.conquest_backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "r2")
@Getter
@Setter
public class R2Properties {

    private String accountId;
    private String accessKey;
    private String secretKey;
    private String bucketImages;
    private String bucketPdfs;
    private String publicUrlImages;
    private String publicUrlPdfs;

}
