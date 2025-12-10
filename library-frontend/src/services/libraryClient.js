const STORAGE_KEY = 'library-ui-state/v1';

const seedDataset = {
  books: [
    {
      id: 'bk-clean-code',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Software Engineering',
      createdAt: '2024-11-01T08:30:00.000Z',
    },
    {
      id: 'bk-designing-data',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '9781449373320',
      category: 'Data Systems',
      createdAt: '2024-11-02T08:30:00.000Z',
    },
    {
      id: 'bk-patterns-of-enterprise',
      title: 'Patterns of Enterprise Application Architecture',
      author: 'Martin Fowler',
      isbn: '9780321127426',
      category: 'Architecture',
      createdAt: '2024-11-03T08:30:00.000Z',
    },
  ],
  members: [
    {
      id: 'mb-sara',
      name: 'Sara Winters',
      email: 'sara.winters@example.com',
      phone: '+1 (312) 555-1221',
      joinedAt: '2024-10-12T10:00:00.000Z',
    },
    {
      id: 'mb-rahul',
      name: 'Rahul Mehta',
      email: 'rahul.mehta@example.com',
      phone: '+91 9988 112233',
      joinedAt: '2024-10-18T11:30:00.000Z',
    },
    {
      id: 'mb-lina',
      name: 'Lina Ortiz',
      email: 'lina.ortiz@example.com',
      phone: '+44 20 1234 7788',
      joinedAt: '2024-10-25T16:45:00.000Z',
    },
  ],
  loans: [
    {
      id: 'ln-001',
      bookId: 'bk-designing-data',
      memberId: 'mb-sara',
      borrowedOn: '2024-11-10T09:12:00.000Z',
      dueDate: '2024-12-05',
      returnedOn: null,
    },
  ],
};

const hasStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

let inMemoryState = clone(seedDataset);

const delay = (min = 120, max = 260) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min));

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

function readState() {
  if (!hasStorage()) {
    return clone(inMemoryState);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDataset));
    return clone(seedDataset);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedDataset));
    return clone(seedDataset);
  }
}

function writeState(state) {
  if (!hasStorage()) {
    inMemoryState = clone(state);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

async function readOnly() {
  await delay();
  return clone(readState());
}

async function mutate(mutator) {
  await delay();
  const state = readState();
  const result = mutator(state);
  writeState(state);
  return result;
}

export async function getSnapshot() {
  return readOnly();
}

export async function createBook(payload) {
  return mutate((state) => {
    const book = {
      id: generateId('book'),
      title: (payload.title || '').trim(),
      author: (payload.author || '').trim(),
      isbn: (payload.isbn || '').trim(),
      category: (payload.category || '').trim(),
      createdAt: new Date().toISOString(),
    };

    state.books.push(book);
    return book;
  });
}

export async function createMember(payload) {
  return mutate((state) => {
    const member = {
      id: generateId('member'),
      name: (payload.name || '').trim(),
      email: (payload.email || '').trim(),
      phone: (payload.phone || '').trim(),
      joinedAt: new Date().toISOString(),
    };

    state.members.push(member);
    return member;
  });
}

export async function createLoan(payload) {
  return mutate((state) => {
    const { bookId, memberId, dueDate } = payload;
    const book = state.books.find((entry) => entry.id === bookId);
    const member = state.members.find((entry) => entry.id === memberId);

    if (!book) {
      throw new Error('Book not found.');
    }
    if (!member) {
      throw new Error('Member not found.');
    }

    const activeLoan = state.loans.find(
      (loan) => loan.bookId === bookId && !loan.returnedOn
    );

    if (activeLoan) {
      throw new Error('Book is already borrowed.');
    }

    const loan = {
      id: generateId('loan'),
      bookId,
      memberId,
      borrowedOn: new Date().toISOString(),
      dueDate: dueDate || defaultDueDate(),
      returnedOn: null,
    };

    state.loans.push(loan);
    return loan;
  });
}

export async function completeLoan(loanId) {
  return mutate((state) => {
    const loan = state.loans.find((entry) => entry.id === loanId);
    if (!loan) {
      throw new Error('Loan not found.');
    }
    if (loan.returnedOn) {
      return loan;
    }

    loan.returnedOn = new Date().toISOString();
    return loan;
  });
}

export async function resetDemoState() {
  const snapshot = clone(seedDataset);
  writeState(snapshot);
  return readOnly();
}

export function defaultDueDate() {
  const weeks = 2;
  const ms = weeks * 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString().slice(0, 10);
}

