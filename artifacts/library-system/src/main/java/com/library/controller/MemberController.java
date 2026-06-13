package com.library.controller;

import com.library.model.Member;
import com.library.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/members")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping
    public String listMembers(@RequestParam(required = false) String search, Model model) {
        if (search != null && !search.trim().isEmpty()) {
            model.addAttribute("members", memberService.searchMembers(search));
            model.addAttribute("search", search);
        } else {
            model.addAttribute("members", memberService.getAllMembers());
        }
        model.addAttribute("activePage", "members");
        return "members/list";
    }

    @GetMapping("/new")
    public String newMemberForm(Model model) {
        Member member = new Member();
        member.setMemberId(memberService.generateNextMemberId());
        model.addAttribute("member", member);
        model.addAttribute("pageTitle", "Register New Member");
        model.addAttribute("activePage", "members");
        return "members/form";
    }

    @PostMapping("/new")
    public String saveMember(@Valid @ModelAttribute Member member, BindingResult result,
                             RedirectAttributes redirectAttrs, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("pageTitle", "Register New Member");
            model.addAttribute("activePage", "members");
            return "members/form";
        }
        if (memberService.memberIdExists(member.getMemberId())) {
            result.rejectValue("memberId", "duplicate", "Member ID already exists");
            model.addAttribute("pageTitle", "Register New Member");
            return "members/form";
        }
        if (memberService.emailExists(member.getEmail())) {
            result.rejectValue("email", "duplicate", "Email already registered");
            model.addAttribute("pageTitle", "Register New Member");
            return "members/form";
        }
        memberService.saveMember(member);
        redirectAttrs.addFlashAttribute("success", "Member \"" + member.getName() + "\" registered successfully.");
        return "redirect:/members";
    }

    @GetMapping("/{id}/edit")
    public String editMemberForm(@PathVariable Long id, Model model, RedirectAttributes redirectAttrs) {
        return memberService.getMemberById(id)
                .map(member -> {
                    model.addAttribute("member", member);
                    model.addAttribute("pageTitle", "Edit Member");
                    return "members/form";
                })
                .orElseGet(() -> {
                    redirectAttrs.addFlashAttribute("error", "Member not found.");
                    return "redirect:/members";
                });
    }

    @PostMapping("/{id}/edit")
    public String updateMember(@PathVariable Long id, @Valid @ModelAttribute Member member,
                               BindingResult result, RedirectAttributes redirectAttrs, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("pageTitle", "Edit Member");
            return "members/form";
        }
        member.setId(id);
        memberService.saveMember(member);
        redirectAttrs.addFlashAttribute("success", "Member updated successfully.");
        return "redirect:/members";
    }

    @PostMapping("/{id}/delete")
    public String deleteMember(@PathVariable Long id, RedirectAttributes redirectAttrs) {
        memberService.getMemberById(id).ifPresent(m -> {
            memberService.deleteMember(id);
            redirectAttrs.addFlashAttribute("success", "Member \"" + m.getName() + "\" removed.");
        });
        return "redirect:/members";
    }
}
