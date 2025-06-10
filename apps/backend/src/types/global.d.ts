export { };

declare global {
    var testHelper: {
        generateMockUser: (overrides?: Partial<User>) => User;
        generateMockAuthResponse: (user?: User) => AuthResponse;
        generateMockToken: () => string;
        generateValidPassword: () => string;
        generateInvalidPasswords: () => string[];
        generateMockGoogleProfile: () => GoogleProfile;
    };

}
