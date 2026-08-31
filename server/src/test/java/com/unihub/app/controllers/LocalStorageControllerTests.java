package com.unihub.app.controllers;

import com.unihub.app.BaseIntegrationTest;
import com.unihub.app.domain.RoleType;
import com.unihub.app.dto.UserDto;
import com.unihub.app.security.JwtAuthentication;
import com.unihub.app.services.authorization.AuthorizationService;
import com.unihub.app.services.storage.FileSystemFileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
public class LocalStorageControllerTests extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FileSystemFileStorageService fileSystemFileStorageService;

    @MockitoBean
    private AuthorizationService authorizationService;

    private UUID userId;
    private UserDto userDto;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        userDto = new UserDto(userId, "david@example.com", "david", false, RoleType.ADMIN);
        JwtAuthentication auth = new JwtAuthentication(userDto);
        SecurityContextHolder.getContext().setAuthentication(auth);
        when(authorizationService.safeRequireAuthentication()).thenReturn(auth);
    }

    @Test
    @DisplayName("PUT /api/v1/storage/local/upload accepts file content")
    public void testUploadLocalFile_Success() throws Exception {
        doNothing().when(fileSystemFileStorageService).saveLocalFile(eq("test/key.pdf"), any(InputStream.class));

        mockMvc.perform(put("/api/v1/storage/local/upload")
                        .param("key", "test/key.pdf")
                        .contentType(MediaType.APPLICATION_PDF)
                        .content(new byte[]{1, 2, 3, 4}))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/v1/storage/local/download returns stored file")
    public void testDownloadLocalFile_Success() throws Exception {
        byte[] payload = "test content".getBytes();
        Resource resource = new ByteArrayResource(payload);
        Path path = Paths.get("test/key.txt");

        when(fileSystemFileStorageService.loadLocalFileAsResource("test/key.txt")).thenReturn(resource);
        when(fileSystemFileStorageService.resolvePath("test/key.txt")).thenReturn(path);

        mockMvc.perform(get("/api/v1/storage/local/download")
                        .param("key", "test/key.txt"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(payload));
    }
}
