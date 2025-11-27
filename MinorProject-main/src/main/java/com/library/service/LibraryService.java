package com.library.service;

import com.library.model.Book;
import com.library.model.Member;
import com.library.storage.DataStore;
import com.library.storage.DataStore.LibraryState;

import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

public class LibraryService {
    private LibraryState state;

    public LibraryService() {
        state = DataStore.load();
    }

    public void save() {
        DataStore.save(state);
    }

    public Book addBook(String title, String author, String isbn, int copies) {
        Book b = new Book(title, author, isbn, copies);
        state.books.put(b.getId(), b);
        save();
        return b;
    }

    public Member addMember(String name, String email) {
        Member m = new Member(name, email);
        state.members.put(m.getId(), m);
        save();
        return m;
    }

    public Collection<Book> listBooks() { return state.books.values(); }
    public Collection<Member> listMembers() { return state.members.values(); }

    public Optional<Book> findBookById(UUID id) { return Optional.ofNullable(state.books.get(id)); }
    public Optional<Member> findMemberById(UUID id) { return Optional.ofNullable(state.members.get(id)); }

    public List<Book> searchBooksByTitle(String query) {
        String q = query.toLowerCase();
        return state.books.values().stream()
                .filter(b -> b.getTitle().toLowerCase().contains(q))
                .collect(Collectors.toList());
    }

    public List<Book> searchBooksByAuthor(String query) {
        String q = query.toLowerCase();
        return state.books.values().stream()
                .filter(b -> b.getAuthor().toLowerCase().contains(q))
                .collect(Collectors.toList());
    }

    public boolean borrowBook(UUID memberId, UUID bookId) {
        Member m = state.members.get(memberId);
        Book b = state.books.get(bookId);
        if (m == null || b == null) return false;
        if (b.borrow()) {
            m.borrowBook(bookId);
            save();
            return true;
        }
        return false;
    }

    public boolean returnBook(UUID memberId, UUID bookId) {
        Member m = state.members.get(memberId);
        Book b = state.books.get(bookId);
        if (m == null || b == null) return false;
        boolean removed = m.returnBook(bookId);
        if (removed) {
            b.giveBack();
            save();
            return true;
        }
        return false;
    }

    public void importState(LibraryState newState) {
        this.state = newState;
        save();
    }
}