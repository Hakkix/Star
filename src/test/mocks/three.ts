/**
 * Basic Three.js mocks for testing
 * These mocks prevent WebGL errors in test environment
 *
 * NOTE: For most tests, we test the logic, not the 3D rendering
 * Full 3D visual tests should be done in E2E with Playwright
 */

import { vi } from 'vitest';

export const mockVector3 = {
  set: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
  applyQuaternion: vi.fn().mockReturnThis(),
  normalize: vi.fn().mockReturnThis(),
  add: vi.fn().mockReturnThis(),
  sub: vi.fn().mockReturnThis(),
  multiplyScalar: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  z: 0,
};

export const mockQuaternion = {
  setFromEuler: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  copy: vi.fn().mockReturnThis(),
  setFromAxisAngle: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  z: 0,
  w: 1,
};

export const mockEuler = {
  set: vi.fn().mockReturnThis(),
  x: 0,
  y: 0,
  z: 0,
  order: 'XYZ',
};

export const mockMatrix4 = {
  set: vi.fn().mockReturnThis(),
  identity: vi.fn().mockReturnThis(),
  makeRotationFromEuler: vi.fn().mockReturnThis(),
  multiply: vi.fn().mockReturnThis(),
  elements: new Array(16).fill(0),
};

export const mockObject3D = {
  position: mockVector3,
  rotation: mockEuler,
  quaternion: mockQuaternion,
  scale: mockVector3,
  matrix: mockMatrix4,
  matrixWorld: mockMatrix4,
  updateMatrix: vi.fn(),
  updateMatrixWorld: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
};

export const mockCamera = {
  ...mockObject3D,
  fov: 75,
  aspect: 1,
  near: 0.1,
  far: 1000,
  updateProjectionMatrix: vi.fn(),
};

export const mockScene = {
  ...mockObject3D,
  background: null,
  add: vi.fn(),
  remove: vi.fn(),
};

export const mockRenderer = {
  setSize: vi.fn(),
  render: vi.fn(),
  dispose: vi.fn(),
  domElement: document.createElement('canvas'),
};

/**
 * Helper to create a mock Three.js module
 * Use this in tests where you need to mock Three.js imports
 */
export function createThreeMock() {
  return {
    Vector3: vi.fn(() => ({ ...mockVector3 })),
    Quaternion: vi.fn(() => ({ ...mockQuaternion })),
    Euler: vi.fn(() => ({ ...mockEuler })),
    Matrix4: vi.fn(() => ({ ...mockMatrix4 })),
    Object3D: vi.fn(() => ({ ...mockObject3D })),
    PerspectiveCamera: vi.fn(() => ({ ...mockCamera })),
    Scene: vi.fn(() => ({ ...mockScene })),
    WebGLRenderer: vi.fn(() => ({ ...mockRenderer })),
    // Add more as needed
  };
}
