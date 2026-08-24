package com.unihub.app.services.globalResources;

import com.unihub.app.repositories.globalResources.RatingMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RatingMetricService {

    private final RatingMetricRepository ratingMetricRepository;

}
