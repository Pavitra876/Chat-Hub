package com.library.controller;

import com.library.service.BookService;
import com.library.service.IssueService;
import com.library.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @Autowired private BookService bookService;
    @Autowired private MemberService memberService;
    @Autowired private IssueService issueService;

    @GetMapping("/")
    public String dashboard(Model model) {
        model.addAttribute("totalBooks", bookService.countTotalBooks());
        model.addAttribute("availableBooks", bookService.countAvailableBooks());
        model.addAttribute("totalMembers", memberService.countTotalMembers());
        model.addAttribute("activeMembers", memberService.countActiveMembers());
        model.addAttribute("activeIssues", issueService.countActiveIssues());
        model.addAttribute("overdueIssues", issueService.countOverdueIssues());
        model.addAttribute("totalIssues", issueService.countTotalIssues());
        model.addAttribute("recentIssues", issueService.getActiveIssues());
        model.addAttribute("activePage", "dashboard");
        return "dashboard";
    }
}
