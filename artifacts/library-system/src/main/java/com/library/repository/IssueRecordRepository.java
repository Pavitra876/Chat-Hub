package com.library.repository;

import com.library.model.IssueRecord;
import com.library.model.IssueRecord.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface IssueRecordRepository extends JpaRepository<IssueRecord, Long> {
    List<IssueRecord> findByMemberId(Long memberId);
    List<IssueRecord> findByBookId(Long bookId);
    List<IssueRecord> findByStatus(Status status);

    @Query("SELECT ir FROM IssueRecord ir WHERE ir.status = 'ISSUED' AND ir.dueDate < :today")
    List<IssueRecord> findOverdueRecords(LocalDate today);

    long countByStatus(Status status);

    boolean existsByBookIdAndMemberIdAndStatus(Long bookId, Long memberId, Status status);

    @Query("SELECT COALESCE(SUM(r.fine), 0) FROM IssueRecord r WHERE r.status = :status")
    BigDecimal sumFinesByStatus(@Param("status") Status status);
}
