import { useEffect, useMemo, useState } from 'react';
import {
  completeLoan,
  createBook,
  createLoan,
  createMember,
  defaultDueDate,
  getSnapshot,
  resetDemoState,
} from './services/libraryClient';
import './App.css';

const TABS = [
  { id: 'books', label: 'Books' },
  { id: 'members', label: 'Members' },
  { id: 'loans', label: 'Borrow & Return' },
];

const BOOK_FORM = { title: '', author: '', isbn: '', category: '' };
const MEMBER_FORM = { name: '', email: '', phone: '' };
const buildLoanForm = () => ({ bookId: '', memberId: '', dueDate: defaultDueDate() });

function App() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('books');
  const [bookForm, setBookForm] = useState(BOOK_FORM);
  const [memberForm, setMemberForm] = useState(MEMBER_FORM);
  const [loanForm, setLoanForm] = useState(buildLoanForm());
  const [filters, setFilters] = useState({ books: '', members: '' });
  const [banner, setBanner] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (!banner) {
      return () => {};
    }
    const timeout = setTimeout(() => setBanner(null), 3600);
    return () => clearTimeout(timeout);
  }, [banner]);

  async function bootstrap(message) {
    try {
      setLoading(true);
      const snapshot = await getSnapshot();
      setBooks(snapshot.books ?? []);
      setMembers(snapshot.members ?? []);
      setLoans(snapshot.loans ?? []);
      if (message) {
        setBanner({ type: 'success', message });
      }
    } catch (error) {
      setBanner({
        type: 'error',
        message:
          error?.message ||
          'Unable to load the local library data. You can continue working in memory.',
      });
      setBooks([]);
      setMembers([]);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }

  const activeLoans = useMemo(
    () => loans.filter((loan) => !loan.returnedOn),
    [loans]
  );

  const overdueLoans = useMemo(
    () =>
      activeLoans.filter((loan) => {
        if (!loan.dueDate) {
          return false;
        }
        return new Date(loan.dueDate) < new Date();
      }),
    [activeLoans]
  );

  const availableBooks = useMemo(() => {
    const loanedIds = new Set(activeLoans.map((loan) => loan.bookId));
    return books.filter((book) => !loanedIds.has(book.id));
  }, [books, activeLoans]);

  const bookLookup = useMemo(() => {
    const map = new Map();
    books.forEach((book) => map.set(book.id, book));
    return map;
  }, [books]);

  const memberLookup = useMemo(() => {
    const map = new Map();
    members.forEach((member) => map.set(member.id, member));
    return map;
  }, [members]);

  const filteredBooks = useMemo(() => {
    const term = filters.books.trim().toLowerCase();
    if (!term) {
      return books;
    }
    return books.filter((book) =>
      [book.title, book.author, book.isbn, book.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [books, filters.books]);

  const filteredMembers = useMemo(() => {
    const term = filters.members.trim().toLowerCase();
    if (!term) {
      return members;
    }
    return members.filter((member) =>
      [member.name, member.email, member.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [members, filters.members]);

  function updateBanner(type, message) {
    setBanner({ type, message });
  }

  const isPending = (action) => pendingAction === action;

  async function handleAddBook(event) {
    event.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      updateBanner('error', 'Title and author are required to add a book.');
      return;
    }
    try {
      setPendingAction('book');
      const created = await createBook(bookForm);
      setBooks((prev) => [...prev, created]);
      setBookForm(BOOK_FORM);
      updateBanner('success', `"${created.title}" was added to the catalog.`);
    } catch (error) {
      updateBanner('error', error?.message || 'Unable to add the book.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleAddMember(event) {
    event.preventDefault();
    if (!memberForm.name.trim()) {
      updateBanner('error', 'Member name is required.');
      return;
    }
    try {
      setPendingAction('member');
      const created = await createMember(memberForm);
      setMembers((prev) => [...prev, created]);
      setMemberForm(MEMBER_FORM);
      updateBanner('success', `${created.name} was added as a member.`);
    } catch (error) {
      updateBanner('error', error?.message || 'Unable to add the member.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateLoan(event) {
    event.preventDefault();
    if (!loanForm.bookId || !loanForm.memberId) {
      updateBanner('error', 'Select both a book and a member to record a loan.');
      return;
    }
    try {
      setPendingAction('loan');
      const created = await createLoan(loanForm);
      setLoans((prev) => [...prev, created]);
      setLoanForm(buildLoanForm());
      updateBanner('success', 'Loan has been recorded.');
    } catch (error) {
      updateBanner('error', error?.message || 'Unable to create the loan.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleReturnLoan(loanId) {
    try {
      setPendingAction(`return-${loanId}`);
      const updated = await completeLoan(loanId);
      setLoans((prev) => prev.map((loan) => (loan.id === loanId ? updated : loan)));
      updateBanner('success', 'Book marked as returned.');
    } catch (error) {
      updateBanner('error', error?.message || 'Unable to complete the loan.');
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResetDemo() {
    try {
      setPendingAction('reset');
      const snapshot = await resetDemoState();
      setBooks(snapshot.books ?? []);
      setMembers(snapshot.members ?? []);
      setLoans(snapshot.loans ?? []);
      updateBanner('success', 'Demo data has been restored.');
    } catch (error) {
      updateBanner('error', error?.message || 'Unable to reset the dataset.');
    } finally {
      setPendingAction(null);
    }
  }

  const totalBooks = books.length;
  const totalMembers = members.length;
  const borrowedCount = activeLoans.length;
  const overdueCount = overdueLoans.length;

  const emptyState = (
    <div className="empty-state">
      <p>Loading the library workspace...</p>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Library Management</p>
          <h1>Web Control Room</h1>
          <p className="subheading">
            Monitor your catalog, patrons, and circulation activity from a single
            interface.
          </p>
        </div>
        <button
          className="ghost-button"
          onClick={handleResetDemo}
          disabled={isPending('reset')}
        >
          {isPending('reset') ? 'Resetting…' : 'Restore demo data'}
        </button>
      </header>

      {banner && (
        <div className={`banner banner-${banner.type}`}>
          <span>{banner.message}</span>
        </div>
      )}

      <section className="kpi-grid">
        <article className="kpi-card">
          <p className="label">Books in catalog</p>
          <p className="value">{totalBooks}</p>
          <p className="hint">{borrowedCount} currently borrowed</p>
        </article>
        <article className="kpi-card">
          <p className="label">Registered members</p>
          <p className="value">{totalMembers}</p>
          <p className="hint">
            {totalMembers ? `${((borrowedCount / totalMembers) * 100).toFixed(0)}%`
            : 0}
            {totalMembers ? ' borrowing right now' : ''}
          </p>
        </article>
        <article className="kpi-card">
          <p className="label">Active loans</p>
          <p className="value">{borrowedCount}</p>
          <p className="hint">{overdueCount} overdue</p>
        </article>
        <article className="kpi-card">
          <p className="label">Available titles</p>
          <p className="value">{availableBooks.length}</p>
          <p className="hint">Ready for checkout</p>
        </article>
      </section>

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {loading ? (
        emptyState
      ) : (
        <main className="tab-panels">
          {activeTab === 'books' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Catalog</h2>
                  <p>Search, filter, and register new titles.</p>
                </div>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search by title, author, or ISBN"
                  value={filters.books}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, books: event.target.value }))
                  }
                />
              </div>
              <div className="panel-grid">
                <div className="list-card">
                  <div className="card-header">
                    <h3>Books ({filteredBooks.length})</h3>
                  </div>
                  <div className="table-wrapper">
                    {filteredBooks.length === 0 ? (
                      <p className="muted">No books match the current filter.</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBooks.map((book) => {
                            const loan = activeLoans.find(
                              (entry) => entry.bookId === book.id
                            );
                            return (
                              <tr key={book.id}>
                                <td>
                                  <span className="primary">{book.title}</span>
                                  {book.category && (
                                    <span className="pill">{book.category}</span>
                                  )}
                                </td>
                                <td>{book.author}</td>
                                <td>{book.isbn || '—'}</td>
                                <td>
                                  {loan ? (
                                    <span className="status status-warning">
                                      Borrowed
                                    </span>
                                  ) : (
                                    <span className="status status-success">
                                      Available
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="form-card">
                  <div className="card-header">
                    <h3>Add a new book</h3>
                    <p>Required fields: title, author</p>
                  </div>
                  <form onSubmit={handleAddBook} className="stacked-form">
                    <label>
                      Title
                      <input
                        type="text"
                        value={bookForm.title}
                        onChange={(event) =>
                          setBookForm((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="e.g. Clean Architecture"
                      />
                    </label>
                    <label>
                      Author
                      <input
                        type="text"
                        value={bookForm.author}
                        onChange={(event) =>
                          setBookForm((prev) => ({
                            ...prev,
                            author: event.target.value,
                          }))
                        }
                        placeholder="e.g. Robert C. Martin"
                      />
                    </label>
                    <label>
                      ISBN
                      <input
                        type="text"
                        value={bookForm.isbn}
                        onChange={(event) =>
                          setBookForm((prev) => ({ ...prev, isbn: event.target.value }))
                        }
                        placeholder="9780134494166"
                      />
                    </label>
                    <label>
                      Category
                      <input
                        type="text"
                        value={bookForm.category}
                        onChange={(event) =>
                          setBookForm((prev) => ({
                            ...prev,
                            category: event.target.value,
                          }))
                        }
                        placeholder="Architecture, DevOps, etc."
                      />
                    </label>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isPending('book')}
                    >
                      {isPending('book') ? 'Saving…' : 'Add book'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'members' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Members</h2>
                  <p>Track readers and their contact details.</p>
                </div>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search members"
                  value={filters.members}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, members: event.target.value }))
                  }
                />
              </div>
              <div className="panel-grid">
                <div className="list-card">
                  <div className="card-header">
                    <h3>Registered members ({filteredMembers.length})</h3>
                  </div>
                  <div className="table-wrapper">
                    {filteredMembers.length === 0 ? (
                      <p className="muted">No members match the filter.</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((member) => (
                            <tr key={member.id}>
                              <td className="primary">{member.name}</td>
                              <td>{member.email || '—'}</td>
                              <td>{member.phone || '—'}</td>
                              <td>{formatDate(member.joinedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="form-card">
                  <div className="card-header">
                    <h3>Add a new member</h3>
                    <p>Only name is required. Add contact info if available.</p>
                  </div>
                  <form onSubmit={handleAddMember} className="stacked-form">
                    <label>
                      Name
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(event) =>
                          setMemberForm((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="e.g. Priya Singh"
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        value={memberForm.email}
                        onChange={(event) =>
                          setMemberForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        placeholder="reader@example.com"
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        type="tel"
                        value={memberForm.phone}
                        onChange={(event) =>
                          setMemberForm((prev) => ({
                            ...prev,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="+91 90000 00000"
                      />
                    </label>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={isPending('member')}
                    >
                      {isPending('member') ? 'Saving…' : 'Add member'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'loans' && (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Borrow & Return</h2>
                  <p>Record circulation activity and resolve overdue items.</p>
                </div>
              </div>
              <div className="panel-grid">
                <div className="list-card">
                  <div className="card-header">
                    <h3>Active loans ({activeLoans.length})</h3>
                  </div>
                  <div className="table-wrapper">
                    {activeLoans.length === 0 ? (
                      <p className="muted">No books are currently checked out.</p>
                    ) : (
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Book</th>
                            <th>Borrower</th>
                            <th>Borrowed on</th>
                            <th>Due date</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {activeLoans.map((loan) => {
                            const book = bookLookup.get(loan.bookId);
                            const member = memberLookup.get(loan.memberId);
                            const isOverdue =
                              loan.dueDate && new Date(loan.dueDate) < new Date();
                            return (
                              <tr key={loan.id}>
                                <td>
                                  <span className="primary">{book?.title}</span>
                                  <p className="muted tiny">{book?.author}</p>
                                </td>
                                <td>
                                  <span className="primary">{member?.name}</span>
                                  <p className="muted tiny">{member?.email}</p>
                                </td>
                                <td>{formatDate(loan.borrowedOn)}</td>
                                <td>
                                  <span
                                    className={
                                      isOverdue ? 'status status-error' : 'status status-success'
                                    }
                                  >
                                    {loan.dueDate ? formatDate(loan.dueDate) : '—'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="ghost-button small"
                                    onClick={() => handleReturnLoan(loan.id)}
                                    disabled={isPending(`return-${loan.id}`)}
                                  >
                                    {isPending(`return-${loan.id}`) ? 'Saving…' : 'Mark returned'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="form-card">
                  <div className="card-header">
                    <h3>Record a loan</h3>
                    <p>Select an available book and a registered member.</p>
                  </div>
                  <form onSubmit={handleCreateLoan} className="stacked-form">
                    <label>
                      Book
                      <select
                        value={loanForm.bookId}
                        onChange={(event) =>
                          setLoanForm((prev) => ({ ...prev, bookId: event.target.value }))
                        }
                        disabled={availableBooks.length === 0}
                      >
                        <option value="">Select a title</option>
                        {availableBooks.map((book) => (
                          <option key={book.id} value={book.id}>
                            {book.title} — {book.author}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Member
                      <select
                        value={loanForm.memberId}
                        onChange={(event) =>
                          setLoanForm((prev) => ({ ...prev, memberId: event.target.value }))
                        }
                        disabled={members.length === 0}
                      >
                        <option value="">Select a member</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Due date
                      <input
                        type="date"
                        value={loanForm.dueDate}
                        onChange={(event) =>
                          setLoanForm((prev) => ({ ...prev, dueDate: event.target.value }))
                        }
                      />
                    </label>
                    <button
                      type="submit"
                      className="primary-button"
                      disabled={
                        isPending('loan') ||
                        availableBooks.length === 0 ||
                        members.length === 0
                      }
                    >
                      {isPending('loan') ? 'Recording…' : 'Record loan'}
                    </button>
                    {availableBooks.length === 0 && (
                      <p className="muted tiny">
                        All books are currently checked out. Return one to continue.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default App;
