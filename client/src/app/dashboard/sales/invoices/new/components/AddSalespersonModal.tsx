/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";

interface AddSalespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (sp: { _id: string; name: string; email: string }) => void;
}

const AddSalespersonModal: React.FC<AddSalespersonModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [list, setList] = useState<
    { _id: string; name: string; email: string }[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchList = async () => {
      try {
        setIsLoadingList(true);
        const base =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
        const url = search
          ? `${base}/api/salespersons?search=${encodeURIComponent(search)}`
          : `${base}/api/salespersons`;
        const res = await fetch(url, { credentials: "include" });
        const json = await res.json();
        setList(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        setList([]);
      } finally {
        setIsLoadingList(false);
      }
    };
    const id = setTimeout(fetchList, 250);
    return () => clearTimeout(id);
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") +
          "/api/salespersons",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create");
      }
      onCreated(json.data);
      setName("");
      setEmail("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110000]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[min(92vw,720px)] bg-white border border-gray-200 rounded-lg shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
          <div className="text-sm font-semibold text-gray-900">
            Manage Salespersons
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save and Select"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-gray-800">
                Salespersons
              </div>
              <input
                className="px-2 py-1 text-xs border border-gray-300 rounded"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="border border-gray-200 rounded">
              <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-600">
                <div className="px-3 py-2">Salesperson Name</div>
                <div className="px-3 py-2">Email</div>
              </div>
              <div className="max-h-[240px] overflow-y-auto">
                {isLoadingList ? (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Loading...
                  </div>
                ) : list.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    No results
                  </div>
                ) : (
                  list.map((sp) => (
                    <div
                      key={sp._id}
                      className="grid grid-cols-2 hover:bg-gray-50 cursor-pointer text-xs"
                      onClick={() => onCreated(sp)}
                    >
                      <div className="px-3 py-2">{sp.name}</div>
                      <div className="px-3 py-2 text-gray-600">{sp.email}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalespersonModal;
