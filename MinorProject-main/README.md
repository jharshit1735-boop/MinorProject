# Library Management System (Java, Console)

A simple console-based Library Management System written in Java.  
Features:
- Add/list/search books
- Register/list members
- Borrow and return books
- Simple file-based persistence (library.dat)

Requirements:
- Java 11+
- Maven (to build the executable jar)

How to build and run:
1. Build:
   mvn clean package

2. Run:
   java -jar target/library-management-1.0-SNAPSHOT.jar

Data persistence:
- The application stores state in `library.dat` in the working directory when you exit the app (or when you add/modify data). If no file exists, it starts empty.

License:
- MIT