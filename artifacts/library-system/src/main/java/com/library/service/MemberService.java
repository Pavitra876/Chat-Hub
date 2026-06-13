package com.library.service;

import com.library.model.Member;
import com.library.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> getMemberByMemberId(String memberId) {
        return memberRepository.findByMemberId(memberId);
    }

    public Member saveMember(Member member) {
        return memberRepository.save(member);
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }

    public List<Member> searchMembers(String query) {
        if (query == null || query.trim().isEmpty()) return getAllMembers();
        return memberRepository.search(query.trim());
    }

    public boolean memberIdExists(String memberId) {
        return memberRepository.existsByMemberId(memberId);
    }

    public boolean emailExists(String email) {
        return memberRepository.existsByEmail(email);
    }

    public String generateNextMemberId() {
        long count = memberRepository.count() + 1;
        return String.format("MEM%04d", count);
    }

    public long countTotalMembers() {
        return memberRepository.count();
    }

    public long countActiveMembers() {
        return memberRepository.countByActive(true);
    }
}
