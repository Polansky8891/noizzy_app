import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock('../../api/axios', () => ({
    default: { get: vi.fn() },
}));
import api from "../../api/axios";

// Mock de usePlayer con espías exportados
const playTrackSpy = vi.fn();
const togglePlaySpy = vi.fn();
let currentTrackMock = null;

vi.mock('../../components/PlayerContext', () => ({
    usePlayer: () => ({
        playTrack: playTrackSpy,
        togglePlay: togglePlaySpy,
        currentTrack: currentTrackMock,
    }),
}));

import { GenreCard } from "../../components/GenreCard";

const renderAt = (path) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path='/' element={<div>Home</div>} />
                <Route path='/genre/:slug' element={<GenreCard />} />
            </Routes>
        </MemoryRouter>
    );

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    currentTrackMock = null;
});

afterEach(() => {
    vi.resetAllMocks();
});

describe("GenreCard", () => {
    it('muestra cabecera con el género y columnas Title/Artist', () => {
        renderAt('/genre/rock');
        expect(screen.getByRole('heading', { name: 'Rock'})).toBeInTheDocument();
        const headerRow = screen.getByRole('row');
        expect(within(headerRow).getByText('Title')).toBeInTheDocument();
        expect(within(headerRow).getByText('Artist')).toBeInTheDocument();
    });

    it('redirige a / si el slug no es válido', () => {
        renderAt('/genre/metal');
        expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('pinta filas desde la cache inmediatamente', () => {
        const cached = [
            { _id: '1', title: 'Song A', artist: 'X', audioUrl: '/a.mp3', coverUrl: '/a.jpg'},
            { _id: '2', title: 'Song B', artist: 'Y', audioUrl: '/b.mp3', coverUrl: '/b.jpg'},
        ];
        sessionStorage.setItem('tracks:Rock', JSON.stringify(cached));

        renderAt('/genre/rock');

        expect(screen.getByText('Song A')).toBeInTheDocument();
        expect(screen.getByText('Song B')).toBeInTheDocument();
    });

    it('click en cover llama a playTrack con payload correcto', async () => {
        const row = { _id: '1', title: 'Song A', artist: 'X', audioUrl: '/a.mp3', coverUrl: '/a.jpg'};
        sessionStorage.setItem('tracks:Rock', JSON.stringify([row]));
        api.get.mockResolvedValueOnce({ data: { items: [row] } });

        renderAt('/genre/rock');

        fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));

        const base =
        import.meta.env.VITE_MEDIA_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:4000/api";

        expect(playTrackSpy).toHaveBeenCalledWith({
            id: '1',
            title: 'Song A',
            artist: 'X',
            audioPath: new URL('/a.mp3', base).href,
            genre: 'Rock',
            cover: new URL('/a.jpg', base).href,
        });
    });

    it('si la fila está activa, click en cover hace togglePlay (no playTrack)', () => {
        const row = { _id: '1', title: 'Song A', artist: 'X', audioUrl: '/a.mp3', coverUrl: '/a.jpg'};
        const base =
        import.meta.env.VITE_MEDIA_BASE_URL ||
        import.meta.env.VITE_API_URL ||
        'http://localhost:4000/api';
        sessionStorage.setItem('tracks:Rock', JSON.stringify([row]));
        currentTrackMock = { audioPath: new URL('/a.mp3', base).href };

        renderAt('/genre/rock');
        
        fireEvent.click(screen.getByRole('button', { name: /pausar|reanudar/i }));
        expect(togglePlaySpy).toHaveBeenCalledTimes(1);
        expect(playTrackSpy).not.toHaveBeenCalled();
    });

    it('si la API trae items distintos, actualiza y escribe cache', async () => {
        sessionStorage.setItem('tracks:Rock', JSON.stringify([
            { _id: '1', title: 'Song A', artist: 'X', audioUrl: '/a.mp3', coverUrl: '/a.jpg' },
        ]));
        const fresh = [{ _id: '2', title: 'Song B', artist: 'Y', audioUrl: '/b.mp3', coverUrl: '/b.jpg'}];
        const setSpy = vi.spyOn(window.sessionStorage.__proto__, 'setItem');
        api.get.mockResolvedValueOnce({ data: { items: fresh } });

        renderAt('/genre/rock');

        expect(await screen.findByText('Song B')).toBeInTheDocument();
        expect(setSpy).toHaveBeenCalledWith('tracks:Rock', JSON.stringify(fresh));
    });
})

