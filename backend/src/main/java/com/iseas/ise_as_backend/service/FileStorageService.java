package com.iseas.ise_as_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public record StorageResult(String filename, String checksum, long fileSize) {}

    public StorageResult storeWithMetadata(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }
        try {
            byte[] bytes = file.getBytes();

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();
            if (!destination.getParent().equals(rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            Files.write(destination, bytes);

            String checksum = sha256Hex(bytes);
            return new StorageResult(filename, checksum, bytes.length);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    /** Kept for backward-compatibility with any existing callers. */
    public String store(MultipartFile file) {
        return storeWithMetadata(file).filename();
    }

    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    private String sha256Hex(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
