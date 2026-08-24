package com.unihub.app.services.authorization;

import com.unihub.app.repositories.authorization.PermissionRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

}



