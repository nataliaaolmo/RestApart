package com.eventbride.advertisement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;

public class AdvertisementServiceTest {
    @Mock
    private AdvertisementRepository advertisementRepository;

    @InjectMocks
    private AdvertisementService advertisementService;
    
    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll_shouldReturnAllAdvertisements() {
        Advertisement ad1 = new Advertisement();
        ad1.setId(1);
        ad1.setTitle("Oferta 1");
        Advertisement ad2 = new Advertisement();
        ad2.setId(2);
        ad2.setTitle("Oferta 2");

        when(advertisementRepository.findAll()).thenReturn(List.of(ad1, ad2));

        List<Advertisement> result = advertisementService.findAll();

        assertEquals(2, result.size());
        assertEquals("Oferta 1", result.get(0).getTitle());
        assertEquals("Oferta 2", result.get(1).getTitle());
        verify(advertisementRepository).findAll();
    }

    @Test
    void testSave_validAdvertisement_shouldSaveSuccessfully() {
        Advertisement ad = new Advertisement();
        ad.setTitle("Nuevo anuncio");
        ad.setIsVisible(true);

        when(advertisementRepository.save(ad)).thenReturn(ad);

        Advertisement result = advertisementService.save(ad);

        assertNotNull(result);
        assertEquals("Nuevo anuncio", result.getTitle());
        assertTrue(result.getIsVisible());
        verify(advertisementRepository).save(ad);
    }

    @Test
    void testSave_invalidAdvertisement_shouldThrowException() {
        Advertisement ad = new Advertisement(); 

        when(advertisementRepository.save(ad))
            .thenThrow(new DataIntegrityViolationException("Campo obligatorio"));

        assertThrows(DataIntegrityViolationException.class, () ->
            advertisementService.save(ad)
        );

        verify(advertisementRepository).save(ad);
    }

}
