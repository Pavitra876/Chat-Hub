package com.library.repository;

import com.library.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMemberId(String memberId);
    Optional<Member> findByEmail(String email);
    boolean existsByMemberId(String memberId);
    boolean existsByEmail(String email);

    @Query("SELECT m FROM Member m WHERE LOWER(m.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(m.email) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(m.memberId) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Member> search(@Param("q") String query);

    List<Member> findByActive(Boolean active);
    long countByActive(Boolean active);
}
