package com.library.service;

import com.library.model.Book;
import com.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book saveBook(Book book) {
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    public Book updateBook(Book book) {
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) return getAllBooks();
        return bookRepository.search(query.trim());
    }

    public boolean isbnExists(String isbn) {
        return bookRepository.existsByIsbn(isbn);
    }

    public boolean isbnExistsForOther(String isbn, Long excludeId) {
        return bookRepository.findByIsbn(isbn)
                .map(b -> !b.getId().equals(excludeId))
                .orElse(false);
    }

    public long countTotalBooks() {
        return bookRepository.count();
    }

    public long countAvailableBooks() {
        return bookRepository.findByAvailableCopiesGreaterThan(0).size();
    }
}
