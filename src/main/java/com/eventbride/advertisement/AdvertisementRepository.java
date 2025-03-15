package com.eventbride.advertisement;

import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface AdvertisementRepository extends CrudRepository<Advertisement, Integer>{

    List<Advertisement> findAll();
    
}
