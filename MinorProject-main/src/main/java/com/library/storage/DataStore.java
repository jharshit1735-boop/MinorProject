package com.library.storage;

import com.library.model.Book;
import com.library.model.Member;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class DataStore {
    private static final String DEFAULT_FILE = "library.dat";

    public static class LibraryState implements Serializable {
        public Map<UUID, Book> books = new HashMap<>();
        public Map<UUID, Member> members = new HashMap<>();
    }

    public static LibraryState load() {
        return load(DEFAULT_FILE);
    }

    public static LibraryState load(String path) {
        File f = new File(path);
        if (!f.exists()) return new LibraryState();
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(f))) {
            Object obj = ois.readObject();
            if (obj instanceof LibraryState) return (LibraryState) obj;
        } catch (Exception e) {
            System.err.println("Failed to load state: " + e.getMessage());
        }
        return new LibraryState();
    }

    public static void save(LibraryState state) {
        save(state, DEFAULT_FILE);
    }

    public static void save(LibraryState state, String path) {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(path))) {
            oos.writeObject(state);
        } catch (IOException e) {
            System.err.println("Failed to save state: " + e.getMessage());
        }
    }
}