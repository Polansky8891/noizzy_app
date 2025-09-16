import { useState } from "react";
import { FiMail, FiSmartphone } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


const defaultSettings = {
  music:    { email: true,  push: true },
  podcasts: { email: false, push: false },
};

export const Notifications = () => {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);

  // Carga inicial desde API (si hay sesión); si no, usa defaults
  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setError("");
      setSaved(false);
      try {
        if (!isAuth || !token) {
          if (!ignore) setSettings(defaultSettings);
          return;
        }
        const res = await axiosInstance.get("/me/notifications", {
          meta: { skipAuthRedirect: true },
          validateStatus: (s) => s === 200 || s === 204 || s === 404,
        });
        if (!ignore) {
          if (res.status === 200 && res.data && typeof res.data === "object") {
            setSettings({
              music:    { email: !!res.data?.music?.email,    push: !!res.data?.music?.push },
              podcasts: { email: !!res.data?.podcasts?.email, push: !!res.data?.podcasts?.push },
            });
          } else {
            // 204/404 → prefer defaults
            setSettings(defaultSettings);
          }
        }
      } catch (e) {
        if (!ignore) {
          setError(e?.response?.data?.message || e?.message || "Error loading settings");
          setSettings(defaultSettings);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => { ignore = true; };
  }, [isAuth, token]);

  const toggleSetting = (category, type) => {
    setSaved(false);
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type],
      },
    }));
  };

  const handleSave = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      if (!isAuth || !token) {
        setError("You must be logged in to save your preferences.");
        return;
      }
      await axiosInstance.put("/me/notifications", settings, {
        meta: { skipAuthRedirect: true },
      });
      setSaved(true);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const options = [
    {
      key: "music",
      title: "Music and artists",
      description: "Music and news from artists you follow or might like to follow",
    },
    {
      key: "podcasts",
      title: "Podcasts and programs",
      description: "Podcasts and programs we think you might like",
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 p-6 max-w-4xl mx-auto rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Notifications settings</h2>
      <p className="text-gray-600 text-sm mb-6">
        Choose the notifications you want to receive by push or mail. These preferences only apply to these two options.
      </p>

      {loading ? (
        <div className="py-8 text-gray-500">Loading…</div>
      ) : (
        <>
          {/* Cabecera */}
          <div className="grid grid-cols-[1fr_120px_120px] items-center text-sm text-gray-700 mb-3 px-1">
            <div></div>
            <div className="flex items-center gap-1 justify-center">
              <FiMail /> Email
            </div>
            <div className="flex items-center gap-1 justify-center">
              <FiSmartphone /> Push
            </div>
          </div>

          {/* Opciones */}
          {options.map(({ key, title, description }) => (
            <div
              key={key}
              className="grid grid-cols-[1fr_120px_120px] items-start py-4 border-b border-gray-200"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-gray-500 text-sm">{description}</p>
              </div>

              {/* Email */}
              <div className="flex justify-center mt-2">
                <label className="inline-flex items-center cursor-pointer group">
                  <div className="w-5 h-5 border border-gray-400 rounded-sm flex items-center justify-center transition duration-150 ease-in-out bg-white group-hover:border-gray-600">
                    {settings[key].email && <div className="w-3 h-3 bg-gray-800 rounded-sm" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key].email}
                    onChange={() => toggleSetting(key, "email")}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Push */}
              <div className="flex justify-center mt-2">
                <label className="inline-flex items-center cursor-pointer group">
                  <div className="w-5 h-5 border border-gray-400 rounded-sm flex items-center justify-center transition duration-150 ease-in-out bg-white group-hover:border-gray-600">
                    {settings[key].push && <div className="w-3 h-3 bg-gray-800 rounded-sm" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[key].push}
                    onChange={() => toggleSetting(key, "push")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ))}

          {/* Mensajes */}
          {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
          {saved && !error && <div className="text-green-600 text-sm mt-4">Saved ✓</div>}

          {/* Acciones */}
          <div className="bg-gray-50 pt-6 mt-6 flex justify-end space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 font-medium cursor-pointer hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isAuth || saving}
              className="bg-gray-800 text-white font-semibold cursor-pointer px-5 py-2 rounded-full hover:bg-gray-700 transition disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};