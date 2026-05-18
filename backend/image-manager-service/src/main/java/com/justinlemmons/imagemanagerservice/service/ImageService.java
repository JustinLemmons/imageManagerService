package com.justinlemmons.imagemanagerservice.service;

import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import java.io.IOException;

@Service
@Slf4j
public class ImageService {
    private final GridFsTemplate gridFsTemplate;
    private final MongoTemplate mongoTemplate;

    public ImageService(GridFsTemplate gridFsTemplate, MongoTemplate mongoTemplate){
        this.gridFsTemplate = gridFsTemplate;
        this.mongoTemplate = mongoTemplate;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        log.info("Writing to MongoDB database: {}", mongoTemplate.getDb().getName());

        ObjectId id = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );
        return id.toString();
    }
}
