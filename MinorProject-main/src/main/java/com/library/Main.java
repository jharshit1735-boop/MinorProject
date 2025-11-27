package com.library;

import com.library.cli.LibraryCLI;
import com.library.service.LibraryService;

public class Main {
    public static void main(String[] args) {
        LibraryService service = new LibraryService();
        LibraryCLI cli = new LibraryCLI(service);
        cli.start();
    }
}