jest.mock('@/lib/prisma', () => ({
    getPrisma: jest.fn(() => Promise.resolve({
        refreshToken: {
            create: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([]),
            deleteMany: jest.fn().mockResolvedValue({})
        },
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    }))
}));


beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.resetAllMocks();
});
