import { GlobalRegistrator } from '@happy-dom/global-registrator';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

GlobalRegistrator.register();

// RTL's auto-cleanup detection doesn't always fire under bun; register it explicitly
afterEach(cleanup);
