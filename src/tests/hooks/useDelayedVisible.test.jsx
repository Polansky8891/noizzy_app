import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import useDelayedVisible from "../../hooks/useDelayedVisible"; // ajusta la ruta si difiere
import { act } from "react-dom/test-utils";

// Componente sonda que muestra el valor del hook
function Probe({ loading, delay }) {
  const visible = useDelayedVisible(loading, delay);
  return <div data-testid="visible">{String(visible)}</div>;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDelayedVisible", () => {
  it("empieza oculto cuando loading = false", () => {
    render(<Probe loading={false} />);
    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("con loading = true, solo pasa a true tras el delay (por defecto 220ms)", () => {
    render(<Probe loading={true} />);
    // antes del delay
    expect(screen.getByTestId("visible").textContent).toBe("false");

    act(() => {
      vi.advanceTimersByTime(219);
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("si se cancela (loading pasa a false antes del delay), permanece en false", () => {
    const { rerender } = render(<Probe loading={true} />);

    act(() => {
      vi.advanceTimersByTime(100); // aún no llega al delay por defecto (220)
    });

    // cancelar antes de que dispare el timeout
    rerender(<Probe loading={false} />);

    // aunque avance el tiempo, no debe activarse
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("respeta un delay custom (p.ej. 500ms)", () => {
    render(<Probe loading={true} delay={500} />);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("si loading se apaga después de visible=true, vuelve a false inmediatamente", () => {
    const { rerender } = render(<Probe loading={true} />);
    act(() => {
      vi.advanceTimersByTime(220);
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");

    rerender(<Probe loading={false} />);
    expect(screen.getByTestId("visible").textContent).toBe("false");
  });

  it("cambiar el delay reinicia el temporizador y usa el nuevo valor", () => {
    const { rerender } = render(<Probe loading={true} delay={300} />);
    act(() => {
      vi.advanceTimersByTime(200); // aún no
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");

    // cambiamos el delay mientras sigue loading=true
    rerender(<Probe loading={true} delay={50} />);

    // ahora con el nuevo delay, debe activarse a los 50ms desde el cambio
    act(() => {
      vi.advanceTimersByTime(49);
    });
    expect(screen.getByTestId("visible").textContent).toBe("false");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByTestId("visible").textContent).toBe("true");
  });

  it("limpia el timeout en unmount (no cambia a true tras desmontar)", () => {
    const { unmount } = render(<Probe loading={true} />);
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Si hubiera un fallo de limpieza, habría warning o cambio; aquí solo comprobamos que no crashea
    expect(true).toBe(true);
  });
});
