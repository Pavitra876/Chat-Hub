package com.library;

import com.library.model.Book;
import com.library.model.Member;
import com.library.service.BookService;
import com.library.service.IssueService;
import com.library.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private BookService bookService;
    @Autowired private MemberService memberService;
    @Autowired private IssueService issueService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (bookService.countTotalBooks() > 0) return;
        seedBooks();
        seedMembers();
        seedIssues();
    }

    private void seedBooks() {
        String[][] data = {
            {"Clean Code", "Robert C. Martin", "978-0132350884", "Programming", "Prentice Hall", "2008", "3"},
            {"The Pragmatic Programmer", "Andrew Hunt", "978-0201616224", "Programming", "Addison-Wesley", "1999", "2"},
            {"Design Patterns", "Gang of Four", "978-0201633610", "Programming", "Addison-Wesley", "1994", "2"},
            {"Introduction to Algorithms", "Thomas H. Cormen", "978-0262033848", "Algorithms", "MIT Press", "2009", "4"},
            {"Database System Concepts", "Abraham Silberschatz", "978-0078022159", "Database", "McGraw-Hill", "2010", "3"},
            {"Operating System Concepts", "Abraham Silberschatz", "978-1118063330", "OS", "Wiley", "2012", "3"},
            {"Computer Networks", "Andrew Tanenbaum", "978-0132126953", "Networks", "Prentice Hall", "2010", "2"},
            {"Artificial Intelligence", "Stuart Russell", "978-0134610993", "AI", "Pearson", "2020", "2"},
            {"Java: The Complete Reference", "Herbert Schildt", "978-1260440232", "Programming", "McGraw-Hill", "2019", "4"},
            {"Data Structures in Java", "Robert Lafore", "978-0672324536", "Data Structures", "SAMS", "2003", "3"},
        };
        for (String[] d : data) {
            Book b = new Book();
            b.setTitle(d[0]); b.setAuthor(d[1]); b.setIsbn(d[2]);
            b.setCategory(d[3]); b.setPublisher(d[4]); b.setYear(Integer.parseInt(d[5]));
            b.setTotalCopies(Integer.parseInt(d[6]));
            b.setAvailableCopies(Integer.parseInt(d[6]));
            bookService.saveBook(b);
        }
    }

    private void seedMembers() {
        Object[][] data = {
            {"MEM0001", "Rahul Sharma", "rahul@example.com", "9876543210"},
            {"MEM0002", "Priya Singh", "priya@example.com", "9876543211"},
            {"MEM0003", "Amit Kumar", "amit@example.com", "9876543212"},
            {"MEM0004", "Sneha Patel", "sneha@example.com", "9876543213"},
            {"MEM0005", "Vikram Rao", "vikram@example.com", "9876543214"},
        };
        for (Object[] d : data) {
            Member m = new Member();
            m.setMemberId((String) d[0]); m.setName((String) d[1]);
            m.setEmail((String) d[2]); m.setPhone((String) d[3]);
            m.setMembershipDate(LocalDate.now().minusMonths(3));
            m.setMembershipExpiry(LocalDate.now().plusMonths(9));
            memberService.saveMember(m);
        }
    }

    private void seedIssues() {
        try {
            issueService.issueBook(1L, 1L);
            issueService.issueBook(4L, 2L);
            issueService.issueBook(9L, 3L);
        } catch (Exception ignored) {}
    }
}
