package com.library.service;

import com.library.model.Book;
import com.library.model.IssueRecord;
import com.library.model.IssueRecord.Status;
import com.library.model.Member;
import com.library.repository.IssueRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class IssueService {

    @Autowired
    private IssueRecordRepository issueRecordRepository;

    @Autowired
    private BookService bookService;

    @Autowired
    private MemberService memberService;

    public List<IssueRecord> getAllIssueRecords() {
        return issueRecordRepository.findAll();
    }

    public Optional<IssueRecord> getById(Long id) {
        return issueRecordRepository.findById(id);
    }

    public List<IssueRecord> getActiveIssues() {
        return issueRecordRepository.findByStatus(Status.ISSUED);
    }

    public List<IssueRecord> getOverdueRecords() {
        return issueRecordRepository.findOverdueRecords(LocalDate.now());
    }

    @Transactional
    public IssueRecord issueBook(Long bookId, Long memberId) throws Exception {
        Book book = bookService.getBookById(bookId)
                .orElseThrow(() -> new Exception("Book not found"));
        Member member = memberService.getMemberById(memberId)
                .orElseThrow(() -> new Exception("Member not found"));

        if (!book.isAvailable()) {
            throw new Exception("No copies available for this book");
        }
        if (!member.isMembershipValid()) {
            throw new Exception("Member's membership is expired or inactive");
        }
        if (issueRecordRepository.existsByBookIdAndMemberIdAndStatus(bookId, memberId, Status.ISSUED)) {
            throw new Exception("Member has already borrowed this book");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookService.updateBook(book);

        IssueRecord record = new IssueRecord();
        record.setBook(book);
        record.setMember(member);
        record.setIssueDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(14));
        record.setStatus(Status.ISSUED);
        return issueRecordRepository.save(record);
    }

    @Transactional
    public IssueRecord returnBook(Long issueId) throws Exception {
        IssueRecord record = issueRecordRepository.findById(issueId)
                .orElseThrow(() -> new Exception("Issue record not found"));

        if (record.getStatus() == Status.RETURNED) {
            throw new Exception("Book has already been returned");
        }

        record.setReturnDate(LocalDate.now());
        record.setStatus(Status.RETURNED);
        record.setFine(record.calculateFine());

        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookService.updateBook(book);

        return issueRecordRepository.save(record);
    }

    public long countActiveIssues() {
        return issueRecordRepository.countByStatus(Status.ISSUED);
    }

    public long countOverdueIssues() {
        return issueRecordRepository.findOverdueRecords(LocalDate.now()).size();
    }

    public long countTotalIssues() {
        return issueRecordRepository.count();
    }

    public BigDecimal getTotalFinesCollected() {
        BigDecimal total = issueRecordRepository.sumFinesByStatus(IssueRecord.Status.RETURNED);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalPendingFines() {
        return issueRecordRepository.findOverdueRecords(LocalDate.now())
                .stream()
                .map(r -> BigDecimal.valueOf(ChronoUnit.DAYS.between(r.getDueDate(), LocalDate.now()) * 2))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
