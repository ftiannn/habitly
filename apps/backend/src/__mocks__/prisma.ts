const mockUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const prisma = {
    user: mockUser,
};

export default prisma;
