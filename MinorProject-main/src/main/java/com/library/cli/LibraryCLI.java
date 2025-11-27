package com.library.cli;

import com.library.model.Book;
import com.library.model.Member;
import com.library.service.LibraryService;

import java.util.List;
import java.util.Scanner;
import java.util.UUID;

public class LibraryCLI {
    private final LibraryService service;
    private final Scanner scanner;

    public LibraryCLI(LibraryService service) {
        this.service = service;
        this.scanner = new Scanner(System.in);
    }

    public void start() {
        boolean running = true;
        System.out.println("Welcome to the Library Management System");
        while (running) {
            printMenu();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1": addBook(); break;
                case "2": listBooks(); break;
                case "3": searchBooks(); break;
                case "4": addMember(); break;
                case "5": listMembers(); break;
                case "6": borrowBook(); break;
                case "7": returnBook(); break;
                case "0": running = false; break;
                default: System.out.println("Unknown option");
            }
        }
        service.save();
        System.out.println("Goodbye! State saved.");
    }

    private void printMenu() {
        System.out.println("\nSelect an option:");
        System.out.println("1) Add book");
        System.out.println("2) List books");
        System.out.println("3) Search books");
        System.out.println("4) Register member");
        System.out.println("5) List members");
        System.out.println("6) Borrow book");
        System.out.println("7) Return book");
        System.out.println("0) Exit");
        System.out.print("> ");
    }

    private void addBook() {
        System.out.print("Title: ");
        String title = scanner.nextLine().trim();
        System.out.print("Author: ");
        String author = scanner.nextLine().trim();
        System.out.print("ISBN: ");
        String isbn = scanner.nextLine().trim();
        System.out.print("Copies: ");
        int copies = Integer.parseInt(scanner.nextLine().trim());
        Book b = service.addBook(title, author, isbn, copies);
        System.out.println("Added: " + b);
    }

    private void listBooks() {
        System.out.println("Books:");
        for (Book b : service.listBooks()) {
            System.out.println(" - " + b);
        }
    }

    private void searchBooks() {
        System.out.print("Search by (1) title (2) author: ");
        String opt = scanner.nextLine().trim();
        System.out.print("Query: ");
        String q = scanner.nextLine().trim();
        List<Book> results = opt.equals("2") ? service.searchBooksByAuthor(q) : service.searchBooksByTitle(q);
        System.out.println("Results:");
        for (Book b : results) System.out.println(" - " + b);
    }

    private void addMember() {
        System.out.print("Name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Email: ");
        String email = scanner.nextLine().trim();
        Member m = service.addMember(name, email);
        System.out.println("Registered: " + m);
    }

    private void listMembers() {
        System.out.println("Members:");
        for (Member m : service.listMembers()) {
            System.out.println(" - " + m);
        }
    }

    private void borrowBook() {
        System.out.print("Member ID: ");
        UUID mid = UUID.fromString(scanner.nextLine().trim());
        System.out.print("Book ID: ");
        UUID bid = UUID.fromString(scanner.nextLine().trim());
        boolean ok = service.borrowBook(mid, bid);
        System.out.println(ok ? "Borrowed successfully" : "Could not borrow (maybe no copies or invalid ids)");
    }

    private void returnBook() {
        System.out.print("Member ID: ");
        UUID mid = UUID.fromString(scanner.nextLine().trim());
        System.out.print("Book ID: ");
        UUID bid = UUID.fromString(scanner.nextLine().trim());
        boolean ok = service.returnBook(mid, bid);
        System.out.println(ok ? "Returned successfully" : "Could not return (invalid ids or not borrowed)");
    }
}