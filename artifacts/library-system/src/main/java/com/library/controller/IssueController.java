package com.library.controller;

import com.library.service.BookService;
import com.library.service.IssueService;
import com.library.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/issues")
public class IssueController {

    @Autowired private IssueService issueService;
    @Autowired private BookService bookService;
    @Autowired private MemberService memberService;

    @GetMapping
    public String listIssues(@RequestParam(defaultValue = "all") String filter, Model model) {
        switch (filter) {
            case "active"  -> model.addAttribute("issues", issueService.getActiveIssues());
            case "overdue" -> model.addAttribute("issues", issueService.getOverdueRecords());
            default        -> model.addAttribute("issues", issueService.getAllIssueRecords());
        }
        model.addAttribute("filter", filter);
        model.addAttribute("activePage", "issues");
        return "issues/list";
    }

    @GetMapping("/new")
    public String newIssueForm(Model model) {
        model.addAttribute("books", bookService.getAllBooks());
        model.addAttribute("members", memberService.getAllMembers());
        model.addAttribute("activePage", "issues");
        return "issues/form";
    }

    @PostMapping("/new")
    public String issueBook(@RequestParam Long bookId, @RequestParam Long memberId,
                            RedirectAttributes redirectAttrs) {
        try {
            issueService.issueBook(bookId, memberId);
            redirectAttrs.addFlashAttribute("success", "Book issued successfully.");
        } catch (Exception e) {
            redirectAttrs.addFlashAttribute("error", e.getMessage());
            return "redirect:/issues/new";
        }
        return "redirect:/issues";
    }

    @PostMapping("/{id}/return")
    public String returnBook(@PathVariable Long id, RedirectAttributes redirectAttrs) {
        try {
            var record = issueService.returnBook(id);
            String msg = "Book returned successfully.";
            if (record.getFine().compareTo(java.math.BigDecimal.ZERO) > 0) {
                msg += " Fine collected: ₹" + record.getFine();
            }
            redirectAttrs.addFlashAttribute("success", msg);
        } catch (Exception e) {
            redirectAttrs.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/issues";
    }
}
