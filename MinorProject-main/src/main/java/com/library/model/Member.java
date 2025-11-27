package com.library.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Member implements Serializable {
    private final UUID id;
    private String name;
    private String email;
    private final List<java.util.UUID> borrowedBookIds = new ArrayList<>();

    public Member(String name, String email) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.email = email;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<UUID> getBorrowedBookIds() { return borrowedBookIds; }

    public void borrowBook(UUID bookId) {
        borrowedBookIds.add(bookId);
    }

    public boolean returnBook(UUID bookId) {
        return borrowedBookIds.remove(bookId);
    }

    @Override
    public String toString() {
        return String.format("%s | %s | borrowed:%d | id:%s", name, email, borrowedBookIds.size(), id);
    }
}