package com.freelanceflow.backend.repository;

import com.freelanceflow.backend.entity.Client;
import com.freelanceflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUserId(Long userId);
    List<Client> findByUser(User user);
}