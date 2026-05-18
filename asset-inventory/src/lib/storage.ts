import { Asset } from "./assets";

const STORAGE_KEY = "asset_inventory";

export function loadAssets(): Asset[] {
    if (typeof window === "undefined") return [];

    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveAssets(assets: Asset[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}