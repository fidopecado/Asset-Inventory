"use client";

import { getCurrentRole, logout } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Asset } from "@/lib/assets";
import { loadAssets, saveAssets } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
        className="border border-gray-300 px-3 py-2 rounded w-64 bg-white"
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border border-gray-300 px-3 py-2 rounded w-64 bg-white"
      />
      <Button type="submit">Add Asset</Button>
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
    <div className="border border-gray-200 rounded p-4 mb-4 bg-gray-50 text-gray-900">
      <h3 className="font-semibold mb-2">Edit Asset</h3>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 flex-wrap items-center"
      >
        <input
          type="text"
          className="border border-gray-300 px-3 py-2 rounded bg-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="border border-gray-300 px-3 py-2 rounded bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Asset["status"])}
          className="border border-gray-300 px-3 py-2 rounded bg-white cursor-pointer"
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
        </select>

        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
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
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

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
    <main
      style={{ padding: 24 }}
      className="text-gray-900 bg-white min-h-screen"
    >
      <h1 className="text-2xl font-bold mb-4">Assets</h1>

      <Dialog
        open={!!assetToDelete}
        onOpenChange={(open) => {
          if (!open) setAssetToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete {""}
            <strong>{assetToDelete?.name}</strong>? This action cannot be
            undone.
          </p>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (assetToDelete) {
                  deleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }
              }}
            >
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setAssetToDelete(null)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <span className="text-sm text-gray-600">
          Logged in as: <strong>{role.toUpperCase()}</strong>
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            logout();
            setRole("guest");
          }}
        >
          Logout
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search asset name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-64 bg-white"
        />
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | Asset["status"])
          }
          className="border border-gray-300 px-3 py-2 bg-white rounded cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
        </select>
        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 bg-white rounded cursor-pointer"
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
        <p className="text-gray-500 mb-4">No assets found.</p>
      )}

      {editingAsset && (
        <EditAssetForm
          asset={editingAsset}
          onSave={updateAsset}
          onCancel={() => setEditingAsset(null)}
        />
      )}

      {isAdmin && <AddAssetForm onAdd={addAsset} />}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border border-gray-200 rounded bg-white">
          <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
            <tr>
              <th
                className="border-r border-gray-200 px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                Asset Name{" "}
                {sortKey === "name" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border-r border-gray-200 px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortKey === "category" &&
                  (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="border-r border-gray-200 px-4 py-2 text-left cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortKey === "status" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              {isAdmin && <th className="px-4 py-2 text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {sortedAssets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                <td className="border-r border-gray-100 px-4 py-2 font-medium">
                  {asset.name}
                </td>
                <td className="border-r border-gray-100 px-4 py-2">
                  {asset.category}
                </td>
                <td className="border-r border-gray-100 px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      asset.status === "Available"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {asset.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAsset(asset)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setAssetToDelete(asset)}
                    >
                      Delete
                    </Button>
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
