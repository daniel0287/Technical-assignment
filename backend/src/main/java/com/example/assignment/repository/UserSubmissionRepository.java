package com.example.assignment.repository;
import com.example.assignment.model.UserSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSubmissionRepository extends JpaRepository<UserSubmission, Long>{
}
