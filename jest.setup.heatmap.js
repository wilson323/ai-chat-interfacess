// Jest setup for heatmap and analytics tests
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.POSTGRES_USER = 'test';
process.env.POSTGRES_PASSWORD = 'test';
process.env.POSTGRES_DB = 'test_heatmap';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5433';

// Mock Next.js specific globals
global.fetch = jest.fn();
global.Request = jest.fn();
global.Response = jest.fn();

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Mock crypto API
global.crypto = {
  randomUUID: jest.fn(() => 'test-uuid'),
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

// Mock WebSocket
global.WebSocket = jest.fn();

// Mock setTimeout and setInterval for consistent timing
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;

global.setTimeout = (callback, delay, ...args) => {
  return originalSetTimeout(callback, delay || 0, ...args);
};

global.setInterval = (callback, delay, ...args) => {
  return originalSetInterval(callback, delay || 0, ...args);
};

// Setup test database connection
beforeAll(async () => {
  // This would typically create a test database
  // For now, we'll assume it's already set up
});

// Clean up after all tests
afterAll(async () => {
  // This would typically clean up the test database
});

// Clean up before each test
beforeEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
});

// Mock file system operations
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  basename: jest.fn((path) => path.split('/').pop()),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
}));

// Mock Next.js components
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}));

// Mock Next.js image optimization
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn((props) => <img {...props} />),
}));

// Mock Next.js head
jest.mock('next/head', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <>{children}</>),
}));

// Mock authentication
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => Promise.resolve({
    user: {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
    },
  })),
}));

// Mock React Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: jest.fn(({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  )),
  TileLayer: jest.fn((props) => <div data-testid="tile-layer" {...props} />),
  CircleMarker: jest.fn(({ children, ...props }) => (
    <div data-testid="circle-marker" {...props}>
      {children}
    </div>
  )),
  Popup: jest.fn(({ children, ...props }) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  )),
  Marker: jest.fn(({ children, ...props }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  )),
}));

// Mock chart libraries
jest.mock('recharts', () => ({
  LineChart: jest.fn(({ children, ...props }) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  )),
  BarChart: jest.fn(({ children, ...props }) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  )),
  PieChart: jest.fn(({ children, ...props }) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  )),
  XAxis: jest.fn((props) => <div data-testid="x-axis" {...props} />),
  YAxis: jest.fn((props) => <div data-testid="y-axis" {...props} />),
  Tooltip: jest.fn((props) => <div data-testid="tooltip" {...props} />),
  Legend: jest.fn((props) => <div data-testid="legend" {...props} />),
  Line: jest.fn((props) => <div data-testid="line" {...props} />),
  Bar: jest.fn((props) => <div data-testid="bar" {...props} />),
  Pie: jest.fn((props) => <div data-testid="pie" {...props} />),
  Cell: jest.fn((props) => <div data-testid="cell" {...props} />),
}));

// Mock date manipulation libraries
jest.mock('date-fns', () => ({
  format: jest.fn((date, format) => 'formatted-date'),
  parseISO: jest.fn((iso) => new Date(iso)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())),
  endOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)),
  isWithinInterval: jest.fn((date, { start, end }) => date >= start && date <= end),
}));

// Mock Redis client
jest.mock('@/lib/db/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
  keys: jest.fn(),
  flushall: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock database connection
jest.mock('@/lib/db/sequelize', () => ({
  authenticate: jest.fn(),
  define: jest.fn(),
  query: jest.fn(),
  close: jest.fn(),
  Op: {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    ne: '!=',
    in: 'IN',
    notIn: 'NOT IN',
    like: 'LIKE',
    ilike: 'ILIKE',
    between: 'BETWEEN',
    notBetween: 'NOT BETWEEN',
  },
}));

// Test utilities
global.testUtils = {
  // Create mock session data
  createMockSession: (overrides = {}) => ({
    sessionId: `test-session-${Date.now()}`,
    userId: 1,
    agentId: 1,
    messageType: 'text',
    messageCount: 5,
    tokenUsage: 1000,
    responseTime: 200,
    startTime: new Date(),
    endTime: new Date(Date.now() + 30000),
    duration: 30,
    isCompleted: true,
    userSatisfaction: 'positive',
    ...overrides,
  }),

  // Create mock geo data
  createMockGeoData: (overrides = {}) => ({
    ipAddress: '192.168.1.100',
    country: '中国',
    region: '广东省',
    city: '深圳市',
    latitude: 22.5431,
    longitude: 114.0579,
    timezone: 'Asia/Shanghai',
    isp: 'China Telecom',
    ...overrides,
  }),

  // Create mock device info
  createMockDeviceInfo: (overrides = {}) => ({
    browser: 'Chrome',
    os: 'Windows 10',
    deviceType: 'desktop',
    ...overrides,
  }),

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate test data
  generateTestData: (count = 100, options = {}) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        sessionId: `generated-session-${i}`,
        userId: (i % 50) + 1,
        agentId: (i % 5) + 1,
        messageType: ['text', 'image', 'file', 'voice'][Math.floor(Math.random() * 4)],
        messageCount: Math.floor(Math.random() * 20) + 1,
        tokenUsage: Math.floor(Math.random() * 5000) + 100,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        startTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isCompleted: Math.random() > 0.1,
        userSatisfaction: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
        geoLocationId: 1,
        ...options,
      });
    }
    return data;
  },
});

console.log('Heatmap and analytics test environment initialized');