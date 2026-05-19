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

    public ImageService(GridFsTemplate gridFsTemplate){
        this.gridFsTemplate = gridFsTemplate;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        log.info("Writing image to database {}", this.gridFsTemplate.toString());

        ObjectId id = gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        );
        return id.toString();
    }
}
