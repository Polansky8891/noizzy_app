import { describe, it, expect, vi, beforeEach } from "vitest";

/* ─────────── hoisted ─────────── */
const dispatchMock = vi.hoisted(() => vi.fn());

// actions de authSlice – las mockeamos para inspeccionar lo que se despacha
const checkingCredentialsMock = vi.hoisted(() => vi.fn(() => ({ type: "auth/checkingCredentials" })));
const loginMock               = vi.hoisted(() => vi.fn((payload) => ({ type: "auth/login", payload })));
const logoutMock              = vi.hoisted(() => vi.fn((payload) => ({ type: "auth/logout", payload })));

// provider de Firebase
const signInWithGoogleMock    = vi.hoisted(() => vi.fn());

/* ─────────── mocks de módulos ─────────── */
// authSlice (misma ruta que usa el thunk real: "./authSlice")
vi.mock("../../../store/auth/authSlice", () => ({
  checkingCredentials: checkingCredentialsMock,
  login: loginMock,
  logout: logoutMock,
}));

// firebase/providers (misma ruta que usa el thunk real: "../../firebase/providers")
vi.mock("../../../firebase/providers", () => ({
  signInWithGoogle: (...args) => signInWithGoogleMock(...args),
}));

/* ─────────── utils ─────────── */
const importThunks = async () => {
  // import dinámico para aislar caché entre tests
  const mod = await import("../../../store/auth/thunks.js");
  return mod;
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  dispatchMock.mockClear();
});

describe("auth thunks", () => {
  it("checkingAuthentication → despacha checkingCredentials()", async () => {
    const { checkingAuthentication } = await importThunks();

    await checkingAuthentication()(dispatchMock);

    expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({ type: "auth/checkingCredentials" });
    expect(dispatchMock).toHaveBeenCalledTimes(1);
  });

  it("startGoogleSignIn → OK: checkingCredentials + login(result)", async () => {
    const { startGoogleSignIn } = await importThunks();

    const resultOk = {
      ok: true,
      uid: "u1",
      email: "a@b.com",
      displayName: "Ada",
      photoURL: "p.jpg",
      token: "TKN",
    };
    signInWithGoogleMock.mockResolvedValueOnce(resultOk);

    await startGoogleSignIn()(dispatchMock);

    // primer dispatch: checking
    expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: "auth/checkingCredentials" });

    // segundo dispatch: login con el objeto completo que devolvió el provider
    expect(loginMock).toHaveBeenCalledWith(resultOk);
    expect(dispatchMock).toHaveBeenNthCalledWith(2, { type: "auth/login", payload: resultOk });

    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });

    it("startGoogleSignIn → resultado KO: checkingCredentials + logout({ errorMessage })", async () => {
    const { startGoogleSignIn } = await importThunks();

    signInWithGoogleMock.mockResolvedValueOnce({
      ok: false,
      errorMessage: "Popup closed by user",
    });

    await startGoogleSignIn()(dispatchMock);

    expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: "auth/checkingCredentials" });

    expect(logoutMock).toHaveBeenCalledWith({ errorMessage: "Popup closed by user" });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "auth/logout",
      payload: { errorMessage: "Popup closed by user" },
    });

    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });

    it("startGoogleSignIn → excepción: checkingCredentials + logout({ errorMessage })", async () => {
    const { startGoogleSignIn } = await importThunks();

    signInWithGoogleMock.mockRejectedValueOnce(new Error("Network down"));

    await startGoogleSignIn()(dispatchMock);

    expect(checkingCredentialsMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenNthCalledWith(1, { type: "auth/checkingCredentials" });

    expect(logoutMock).toHaveBeenCalledWith({ errorMessage: "Network down" });
    expect(dispatchMock).toHaveBeenNthCalledWith(2, {
      type: "auth/logout",
      payload: { errorMessage: "Network down" },
    });

    expect(dispatchMock).toHaveBeenCalledTimes(2);
  });

  });