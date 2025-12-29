import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen());

afterEach(() => {
    cleanup();
    server.resetHandlers();
});

afterAll(() => server.close());
