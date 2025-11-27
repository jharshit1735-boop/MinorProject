package com.library.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class Book implements Serializable {
    private final UUID id;
    private String title;
    private String author;
    private String isbn;
    private int totalCopies;
    private int availableCopies;

    public Book(String title, String author, String isbn, int copies) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.totalCopies = Math.max(0, copies);
        this.availableCopies = this.totalCopies;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public int getTotalCopies() { return totalCopies; }
    public int getAvailableCopies() { return availableCopies; }

    public boolean borrow() {
        if (availableCopies > 0) {
            availableCopies--;
            return true;
        }
        return false;
    }

    public boolean giveBack() {
        if (availableCopies < totalCopies) {
            availableCopies++;
            return true;
        }
        return false;
    }

    public void addCopies(int more) {
        if (more > 0) {
            totalCopies += more;
            availableCopies += more;
        }
    }

    @Override
    public String toString() {
        return String.format("%s | %s | ISBN:%s | available:%d/%d | id:%s",
                title, author, isbn, availableCopies, totalCopies, id);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Book book = (Book) o;
        return Objects.equals(isbn, book.isbn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(isbn);
    }
}