package com.library.controller;

import com.library.model.Book;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public String listBooks(@RequestParam(required = false) String search, Model model) {
        if (search != null && !search.trim().isEmpty()) {
            model.addAttribute("books", bookService.searchBooks(search));
            model.addAttribute("search", search);
        } else {
            model.addAttribute("books", bookService.getAllBooks());
        }
        model.addAttribute("activePage", "books");
        return "books/list";
    }

    @GetMapping("/new")
    public String newBookForm(Model model) {
        model.addAttribute("book", new Book());
        model.addAttribute("pageTitle", "Add New Book");
        model.addAttribute("activePage", "books");
        return "books/form";
    }

    @PostMapping("/new")
    public String saveBook(@Valid @ModelAttribute Book book, BindingResult result,
                           RedirectAttributes redirectAttrs, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("pageTitle", "Add New Book");
            model.addAttribute("activePage", "books");
            return "books/form";
        }
        if (bookService.isbnExists(book.getIsbn())) {
            result.rejectValue("isbn", "duplicate", "ISBN already exists");
            model.addAttribute("pageTitle", "Add New Book");
            return "books/form";
        }
        book.setAvailableCopies(book.getTotalCopies());
        bookService.saveBook(book);
        redirectAttrs.addFlashAttribute("success", "Book \"" + book.getTitle() + "\" added successfully.");
        return "redirect:/books";
    }

    @GetMapping("/{id}/edit")
    public String editBookForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttrs) {
        return bookService.getBookById(id)
                .map(book -> {
                    model.addAttribute("book", book);
                    model.addAttribute("pageTitle", "Edit Book");
                    return "books/form";
                })
                .orElseGet(() -> {
                    redirectAttrs.addFlashAttribute("error", "Book not found.");
                    return "redirect:/books";
                });
    }

    @PostMapping("/{id}/edit")
    public String updateBook(@PathVariable Long id, @Valid @ModelAttribute Book book,
                             BindingResult result, RedirectAttributes redirectAttrs, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("pageTitle", "Edit Book");
            return "books/form";
        }
        if (bookService.isbnExistsForOther(book.getIsbn(), id)) {
            result.rejectValue("isbn", "duplicate", "ISBN already exists");
            model.addAttribute("pageTitle", "Edit Book");
            return "books/form";
        }
        book.setId(id);
        bookService.updateBook(book);
        redirectAttrs.addFlashAttribute("success", "Book updated successfully.");
        return "redirect:/books";
    }

    @PostMapping("/{id}/delete")
    public String deleteBook(@PathVariable Long id, RedirectAttributes redirectAttrs) {
        bookService.getBookById(id).ifPresent(book -> {
            bookService.deleteBook(id);
            redirectAttrs.addFlashAttribute("success", "Book \"" + book.getTitle() + "\" deleted.");
        });
        return "redirect:/books";
    }
}
