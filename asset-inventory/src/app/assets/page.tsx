"use client";

import { getCurrentRole, logout } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Asset } from "@/lib/assets";
import { loadAssets, saveAssets } from "@/lib/storage";

function AddAssetForm({ onAdd }: { onAdd: (asset: Asset) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !category) return;

    onAdd({
      id: crypto.randomUUID(),
      name,
      category,
      status: "Available",
    });

    setName("");
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mb-4">
      <input
        type="text"
        placeholder="Asset Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded w-64"
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border px-3 py-2 rounded w-64"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
      >
        Add Asset
      </button>
    </form>
  );
}

function EditAssetForm({
  asset,
  onSave,
  onCancel,
}: {
  asset: Asset;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(asset.name);
  const [category, setCategory] = useState(asset.category);
  const [status, setStatus] = useState(asset.status);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    onSave({
      ...asset,
      name,
      category,
      status,
    });
  }

  return (
    <div className="border rounded p-4 mb-4 bg-gray-600">
      <h3 className="font-semibold mb-2">Edit Asset</h3>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
        <input
          type="text"
          className="border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="border px-3 py-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Asset["status"])}
          className="border px-3 py-2 rounded hover:bg-gray-700 bg-gray-600"
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default function AssetsPage() {
  const [role, setRole] = useState<"guest" | "admin">("guest");
  const isAdmin = role === "admin";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Asset["status"]>(
    "All",
  );
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [sortKey, setSortKey] = useState<keyof Asset | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setAssets(loadAssets());
    setRole(getCurrentRole());
    if (getCurrentRole() === "guest") return;
  }, []);

  function addAsset(asset: Asset) {
    const newAssets = [...assets, asset];
    setAssets(newAssets);
    saveAssets(newAssets);
  }

  function deleteAsset(id: string) {
    const newAssets = assets.filter((a) => a.id !== id);
    setAssets(newAssets);
    saveAssets(newAssets);
  }

  function updateAsset(updatedAsset: Asset) {
    const updated = assets.map((Asset) =>
      Asset.id === updatedAsset.id ? updatedAsset : Asset,
    );
    setAssets(updated);
    saveAssets(updated);
    setEditingAsset(null);
  }

  function handleSort(key: keyof Asset) {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || asset.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All" || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortKey) return 0;

    const valueA = a[sortKey];
    const valueB = b[sortKey];

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Assets</h1>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-200">
          Logged in as: <strong>{role.toUpperCase()}</strong>
        </span>

        <button
          onClick={() => {
            logout();
            setRole("guest");
          }}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search asset name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | Asset["status"])
          }
          className="border px-3 py-2 bg-gray-500  hover:bg-gray-600 rounded"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
        </select>
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 bg-gray-500  hover:bg-gray-600 rounded"
        >
          <option value="All">All Categories</option>
          {[...new Set(assets.map((a) => a.category))].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {filteredAssets.length === 0 && (
        <p className="text-gray-500">No assets found.</p>
      )}
      {editingAsset && (
        <EditAssetForm
          asset={editingAsset}
          onSave={updateAsset}
          onCancel={() => setEditingAsset(null)}
        />
      )}
      {isAdmin && <AddAssetForm onAdd={addAsset} />}
      {assets.length === 0 && <p>No assets found.</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded">
          <thead className="bg-black text-white">
            <tr>
              <th
                className="border px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                Asset Name{" "}
                {sortKey === "name" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortKey === "category" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortKey === "status" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              {isAdmin && (
                <th className="border px-4 py-2 text-left">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-gray-600">
                <td className="border px-4 py-2 font-medium">{asset.name}</td>
                <td className="border px-4 py-2">{asset.category}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${asset.status === "Available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {asset.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setEditingAsset(asset)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 cursor-pointer ml-2"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
