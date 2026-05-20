package com.justinlemmons.imagemanagerservice.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    public List<String> getAllImages(){
        List<String> images = new ArrayList<>();
        this.gridFsTemplate.find(new Query()).forEach(ids -> {
            images.add(ids.getObjectId().toHexString());
        });
        return images;
    }

    public Resource getImage(String id){
        GridFSFile file =
                gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(id))));

        if(file == null){
            throw new RuntimeException("Image not found " + id);
        }
        return gridFsTemplate.getResource(file);
    }

    public void deleteImage(String id) {
        gridFsTemplate.delete(
                new Query(Criteria.where("_id").is(new ObjectId(id)))
        );
    }
}
