package edu.bootcamp.authSys.repositoy;

import edu.bootcamp.authSys.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepositoy extends JpaRepository<UserEntity,Long> {

    Optional<UserEntity> findByEmail(String email);
}
