// src/tests/store/auth/AuthListener.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

/* hoisted */
const dispatchMock = vi.hoisted(() => vi.fn());
const authCbRef = vi.hoisted(() => ({ cb: null, unsubSpy: vi.fn() }));
const tokCbRef  = vi.hoisted(() => ({ cb: null, unsubSpy: vi.fn() }));

const checkingCredentialsMock = vi.hoisted(() => vi.fn(() => ({ type: "auth/checking" })));
const loginMock       = vi.hoisted(() => vi.fn((p) => ({ type: "auth/login", payload: p })));
const logoutMock      = vi.hoisted(() => vi.fn(() => ({ type: "auth/logout" })));
const setTokenMock    = vi.hoisted(() => vi.fn((t) => ({ type: "auth/setToken", payload: t })));
const setHydratedMock = vi.hoisted(() => vi.fn((v) => ({ type: "auth/setHydrated", payload: v })));
const FirebaseAuth    = vi.hoisted(() => ({ __FAKE__: true }));

/* mocks */
vi.mock("react-redux", async (orig) => {
  const actual = await orig();
  return { ...actual, useDispatch: () => dispatchMock };
});

// ← mismo path que usa el componente (está al lado de AuthListener.jsx)
vi.mock("../../../store/auth/authSlice", () => ({
  checkingCredentials: checkingCredentialsMock,
  login: loginMock,
  logout: logoutMock,
  setToken: setTokenMock,
  setHydrated: setHydratedMock,
}));

// desde tests/store/auth → src/firebase/config
vi.mock("../../../firebase/config", () => ({ FirebaseAuth }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth, cb) => {
    authCbRef.cb = cb;
    return () => authCbRef.unsubSpy();
  },
  onIdTokenChanged: (_auth, cb) => {
    tokCbRef.cb = cb;
    return () => tokCbRef.unsubSpy();
  },
}));

/* import dinámico del componente */
const importComp = async () =>
  (await import("../../../store/auth/AuthListener.jsx")).default;

/* helpers */
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  dispatchMock.mockClear();
  authCbRef.cb = null;
  tokCbRef.cb = null;
});

/* tests */
describe("<AuthListener />", () => {
  it("al montar despacha checkingCredentials()", async () => {
    const AuthListener = await importComp();
    render(<AuthListener />);
    expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/checking" });
  });

  it("user=null → setToken(null) + logout + setHydrated(true)", async () => {
    const AuthListener = await importComp();
    render(<AuthListener />);
    await authCbRef.cb(null);
    await flush();
    expect(setTokenMock).toHaveBeenCalledWith(null);
    expect(logoutMock).toHaveBeenCalled();
    expect(setHydratedMock).toHaveBeenCalledWith(true);
  });

  it("user válido → setToken(token) + login(payload)", async () => {
    const AuthListener = await importComp();
    render(<AuthListener />);
    const fakeUser = {
      uid: "u1",
      email: "a@b.com",
      displayName: "Ada",
      photoURL: "p.jpg",
      getIdToken: vi.fn().mockResolvedValue("TKN"),
    };
    await authCbRef.cb(fakeUser);
    await flush();
    expect(fakeUser.getIdToken).toHaveBeenCalledWith(false);
    expect(setTokenMock).toHaveBeenCalledWith("TKN");
    expect(loginMock).toHaveBeenCalledWith({
      uid: "u1",
      email: "a@b.com",
      displayName: "Ada",
      photoURL: "p.jpg",
    });
  });

  it("onIdTokenChanged rota token → setToken(nuevo)", async () => {
    const AuthListener = await importComp();
    render(<AuthListener />);
    const fakeUser = { getIdToken: vi.fn().mockResolvedValue("NEW_TKN") };
    await tokCbRef.cb(fakeUser);
    await flush();
    expect(fakeUser.getIdToken).toHaveBeenCalledWith(false);
    expect(setTokenMock).toHaveBeenCalledWith("NEW_TKN");
  });

  it("al desmontar llama a los unsubscribe de ambos listeners", async () => {
    const AuthListener = await importComp();
    const { unmount } = render(<AuthListener />);
    unmount();
    expect(authCbRef.unsubSpy).toHaveBeenCalledTimes(1);
    expect(tokCbRef.unsubSpy).toHaveBeenCalledTimes(1);
  });
});
