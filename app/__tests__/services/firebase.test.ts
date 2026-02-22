jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: '[DEFAULT]' })),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

describe('firebase service', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('authインスタンスをエクスポートする', () => {
    const { auth } = require('../../src/services/firebase');
    expect(auth).toBeDefined();
  });

  it('アプリが未初期化の場合はinitializeAppを呼ぶ', () => {
    const { getApps, initializeApp } = require('firebase/app');
    (getApps as jest.Mock).mockReturnValue([]);
    require('../../src/services/firebase');
    expect(initializeApp).toHaveBeenCalled();
  });

  it('アプリが初期化済みの場合はinitializeAppを呼ばない', () => {
    const { getApps, initializeApp } = require('firebase/app');
    (getApps as jest.Mock).mockReturnValue([{ name: '[DEFAULT]' }]);
    require('../../src/services/firebase');
    expect(initializeApp).not.toHaveBeenCalled();
  });
});
