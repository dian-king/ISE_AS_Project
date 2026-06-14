package com.iseas.ise_as_backend.controller;

import com.iseas.ise_as_backend.model.ReviewCategory;
import com.iseas.ise_as_backend.model.School;
import com.iseas.ise_as_backend.model.User;
import com.iseas.ise_as_backend.repository.ReviewCategoryRepository;
import com.iseas.ise_as_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/review-categories")
@RequiredArgsConstructor
public class ReviewCategoryController {

    private final ReviewCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ReviewCategory>> getAll() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getSchool() != null) {
            return ResponseEntity.ok(
                categoryRepository.findBySchoolIdOrderByDisplayOrderAsc(user.getSchool().getId()));
        }
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewCategory> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review category not found")));
    }

    @PostMapping
    public ResponseEntity<ReviewCategory> create(@RequestBody ReviewCategory request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        School school = user.getSchool();

        if (school != null && categoryRepository.existsByNameAndSchoolId(request.getName(), school.getId())) {
            throw new RuntimeException("A review category with this name already exists for this school.");
        }
        request.setSchool(school);
        return ResponseEntity.ok(categoryRepository.save(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReviewCategory> update(@PathVariable UUID id, @RequestBody ReviewCategory request) {
        ReviewCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review category not found"));
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setWeight(request.getWeight());
        existing.setDisplayOrder(request.getDisplayOrder());
        return ResponseEntity.ok(categoryRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
